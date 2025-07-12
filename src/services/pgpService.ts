import * as openpgp from 'openpgp';
import { supabase } from '@/integrations/supabase/client';

export interface PGPKeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export interface PGPKey {
  id: string;
  key_name: string;
  public_key: string;
  private_key_encrypted: string;
  key_fingerprint: string;
  is_primary: boolean;
  created_at: string;
  expires_at?: string;
}

export class PGPService {
  
  // Generate a new PGP key pair
  static async generateKeyPair(
    name: string, 
    email: string, 
    passphrase: string,
    keySize: number = 4096
  ): Promise<PGPKeyPair> {
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: keySize,
        userIDs: [{ name, email }],
        passphrase,
        format: 'armored'
      });

      // Get fingerprint
      const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });
      const fingerprint = publicKeyObj.getFingerprint().toUpperCase();

      return {
        publicKey,
        privateKey,
        fingerprint
      };
    } catch (error) {
      console.error('Error generating PGP key pair:', error);
      throw new Error('Failed to generate PGP key pair');
    }
  }

  // Encrypt a message using recipient's public key
  static async encryptMessage(
    message: string,
    recipientPublicKey: string,
    senderPrivateKey?: string,
    passphrase?: string
  ): Promise<string> {
    try {
      const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKey });
      
      let signingKeys: openpgp.PrivateKey[] | undefined;
      if (senderPrivateKey && passphrase) {
        const privateKey = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({ armoredKey: senderPrivateKey }),
          passphrase
        });
        signingKeys = [privateKey];
      }

      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey,
        signingKeys,
        format: 'armored'
      });

      return encrypted as string;
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  // Decrypt a message using private key
  static async decryptMessage(
    encryptedMessage: string,
    privateKey: string,
    passphrase: string,
    verificationKeys?: string[]
  ): Promise<{ data: string; verified: boolean; signatures?: any[] }> {
    try {
      const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
      
      const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
        passphrase
      });

      let verificationPublicKeys: openpgp.PublicKey[] | undefined;
      if (verificationKeys && verificationKeys.length > 0) {
        verificationPublicKeys = await Promise.all(
          verificationKeys.map(key => openpgp.readKey({ armoredKey: key }))
        );
      }

      const { data, signatures } = await openpgp.decrypt({
        message,
        decryptionKeys: decryptedPrivateKey,
        verificationKeys: verificationPublicKeys,
        format: 'utf8'
      });

      const verified = signatures ? await signatures[0]?.verified : false;

      return {
        data: data as string,
        verified: !!verified,
        signatures
      };
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  // Sign a message
  static async signMessage(
    message: string,
    privateKey: string,
    passphrase: string
  ): Promise<string> {
    try {
      const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
        passphrase
      });

      const signed = await openpgp.sign({
        message: await openpgp.createCleartextMessage({ text: message }),
        signingKeys: decryptedPrivateKey,
        format: 'armored'
      });

      return signed as string;
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  // Verify a signed message
  static async verifyMessage(
    signedMessage: string,
    publicKey: string
  ): Promise<{ data: string; verified: boolean; signatures?: any[] }> {
    try {
      const message = await openpgp.readCleartextMessage({ cleartextMessage: signedMessage });
      const verificationKey = await openpgp.readKey({ armoredKey: publicKey });

      const { data, signatures } = await openpgp.verify({
        message,
        verificationKeys: verificationKey,
        format: 'utf8'
      });

      const verified = signatures ? await signatures[0]?.verified : false;

      return {
        data: data as string,
        verified: !!verified,
        signatures
      };
    } catch (error) {
      console.error('Error verifying message:', error);
      throw new Error('Failed to verify message');
    }
  }

  // Save key pair to database
  static async saveKeyPair(
    keyName: string,
    publicKey: string,
    privateKey: string,
    fingerprint: string,
    passphrase: string,
    isPrimary: boolean = false
  ): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Encrypt private key with user's passphrase for storage
      const encryptedPrivateKey = await this.encryptPrivateKeyForStorage(privateKey, passphrase);

      const { error } = await supabase
        .from('user_pgp_keys')
        .insert({
          user_id: user.id,
          key_name: keyName,
          public_key: publicKey,
          private_key_encrypted: encryptedPrivateKey,
          key_fingerprint: fingerprint,
          is_primary: isPrimary
        });

      if (error) throw error;

      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_event_type: 'pgp_key_generated',
        p_severity: 'info',
        p_metadata: { fingerprint, key_name: keyName }
      });
    } catch (error) {
      console.error('Error saving key pair:', error);
      throw new Error('Failed to save key pair');
    }
  }

  // Get user's PGP keys
  static async getUserKeys(userId?: string): Promise<PGPKey[]> {
    try {
      let query = supabase.from('user_pgp_keys').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching PGP keys:', error);
      throw new Error('Failed to fetch PGP keys');
    }
  }

  // Delete a PGP key
  static async deleteKey(keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_pgp_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting PGP key:', error);
      throw new Error('Failed to delete PGP key');
    }
  }

  // Set primary key
  static async setPrimaryKey(keyId: string): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // First, unset all primary keys for this user
      await supabase
        .from('user_pgp_keys')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected key as primary
      const { error } = await supabase
        .from('user_pgp_keys')
        .update({ is_primary: true })
        .eq('id', keyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting primary key:', error);
      throw new Error('Failed to set primary key');
    }
  }

  // Encrypt private key for storage (additional layer of encryption)
  private static async encryptPrivateKeyForStorage(
    privateKey: string, 
    passphrase: string
  ): Promise<string> {
    try {
      // For now, we'll store the private key as-is since it's already encrypted with the user's passphrase
      // In production, you might want to add an additional layer of encryption with a master key
      return privateKey;
    } catch (error) {
      console.error('Error encrypting private key for storage:', error);
      throw new Error('Failed to encrypt private key for storage');
    }
  }

  // Decrypt private key from storage
  static async decryptPrivateKeyFromStorage(
    encryptedPrivateKey: string,
    passphrase: string
  ): Promise<string> {
    try {
      // For now, we'll return the private key as-is since it's encrypted with the user's passphrase
      // In production, you might need to decrypt an additional layer first
      return encryptedPrivateKey;
    } catch (error) {
      console.error('Error decrypting private key from storage:', error);
      throw new Error('Failed to decrypt private key from storage');
    }
  }

  // Export public key for sharing
  static async exportPublicKey(keyId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_pgp_keys')
        .select('public_key')
        .eq('id', keyId)
        .single();

      if (error) throw error;
      return data.public_key;
    } catch (error) {
      console.error('Error exporting public key:', error);
      throw new Error('Failed to export public key');
    }
  }

  // Import public key from another user
  static async importPublicKey(armoredKey: string): Promise<{ fingerprint: string; userIds: string[] }> {
    try {
      const publicKey = await openpgp.readKey({ armoredKey });
      const fingerprint = publicKey.getFingerprint().toUpperCase();
      const userIds = publicKey.getUserIDs();

      return { fingerprint, userIds };
    } catch (error) {
      console.error('Error importing public key:', error);
      throw new Error('Failed to import public key');
    }
  }
}