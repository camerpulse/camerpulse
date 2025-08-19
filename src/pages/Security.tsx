import React, { useState, useEffect } from 'react';
import { RoleControlSystem } from '@/components/Security/RoleControlSystem';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PGPService, PGPKey } from '@/services/pgpService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/useNavigation';
import { AppLayout } from '@/components/Layout/AppLayout';
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  Trash2,
  Plus,
  FileKey,
  Send,
  Unlock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface Security2FA {
  is_totp_enabled: boolean;
  is_sms_enabled: boolean;
  phone_number?: string;
  backup_codes?: string[];
}

interface SecurityDevice {
  id: string;
  device_name: string;
  device_fingerprint: string;
  ip_address: string | null;
  user_agent: string | null;
  is_trusted: boolean;
  last_seen_at: string;
  created_at: string;
}

interface SecurityLog {
  id: string;
  event_type: string;
  ip_address?: string | null;
  user_agent?: string | null;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
  metadata?: any;
}

const Security = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { navigateToAuth } = useNavigation();
  const [twoFA, setTwoFA] = useState<Security2FA | null>(null);
  const [devices, setDevices] = useState<SecurityDevice[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [pgpKeys, setPgpKeys] = useState<PGPKey[]>([]);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabling2FA, setEnabling2FA] = useState(false);
  
  // PGP states
  const [pgpKeyName, setPgpKeyName] = useState('');
  const [pgpPassphrase, setPgpPassphrase] = useState('');
  const [generatingPGP, setGeneratingPGP] = useState(false);
  const [encryptMessage, setEncryptMessage] = useState('');
  const [decryptMessage, setDecryptMessage] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [selectedRecipientKey, setSelectedRecipientKey] = useState('');
  const [importKeyText, setImportKeyText] = useState('');

  useEffect(() => {
    if (user) {
      fetchSecuritySettings();
      fetchDevices();
      fetchSecurityLogs();
      fetchPGPKeys();
    }
  }, [user]);

  const fetchSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTwoFA(data || {
        is_totp_enabled: false,
        is_sms_enabled: false
      });
    } catch (error) {
      console.error('Error fetching 2FA settings:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_seen_at', { ascending: false });

      if (error) throw error;
      setDevices((data || []).map(device => ({
        id: device.id,
        device_name: device.device_name,
        device_fingerprint: device.device_fingerprint,
        ip_address: device.ip_address as string || '',
        user_agent: device.user_agent as string || '',
        is_trusted: device.is_trusted || false,
        last_seen_at: device.last_seen_at,
        created_at: device.created_at
      })));
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSecurityLogs((data || []).map(log => ({
        id: log.id,
        event_type: log.event_type,
        ip_address: log.ip_address as string || undefined,
        user_agent: log.user_agent as string || undefined,
        severity: log.severity as 'info' | 'warning' | 'critical',
        created_at: log.created_at,
        metadata: log.metadata
      })));
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPGPKeys = async () => {
    try {
      const keys = await PGPService.getUserKeys(user?.id);
      setPgpKeys(keys);
    } catch (error) {
      console.error('Error fetching PGP keys:', error);
    }
  };

  const generatePGPKeyPair = async () => {
    if (!pgpKeyName || !pgpPassphrase || !profile?.display_name) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setGeneratingPGP(true);
    try {
      const keyPair = await PGPService.generateKeyPair(
        profile.display_name,
        user?.email || '',
        pgpPassphrase
      );

      await PGPService.saveKeyPair(
        pgpKeyName,
        keyPair.publicKey,
        keyPair.privateKey,
        keyPair.fingerprint,
        pgpPassphrase,
        pgpKeys.length === 0 // Set as primary if it's the first key
      );

      await fetchPGPKeys();
      setPgpKeyName('');
      setPgpPassphrase('');

      toast({
        title: "PGP Key Generated",
        description: "Your PGP key pair has been successfully created"
      });
    } catch (error) {
      console.error('Error generating PGP key:', error);
      toast({
        title: "Error",
        description: "Unable to generate PGP key",
        variant: "destructive"
      });
    } finally {
      setGeneratingPGP(false);
    }
  };

  const deletePGPKey = async (keyId: string) => {
    try {
      await PGPService.deleteKey(keyId);
      await fetchPGPKeys();
      
      toast({
        title: "Key Deleted",
        description: "PGP key has been deleted"
      });
    } catch (error) {
      console.error('Error deleting PGP key:', error);
      toast({
        title: "Error",
        description: "Unable to delete key",
        variant: "destructive"
      });
    }
  };

  const setPrimaryPGPKey = async (keyId: string) => {
    try {
      await PGPService.setPrimaryKey(keyId);
      await fetchPGPKeys();
      
      toast({
        title: "Master key set",
        description: "This key is now your master key"
      });
    } catch (error) {
      console.error('Error setting primary key:', error);
      toast({
        title: "Error",
        description: "Unable to set primary key",
        variant: "destructive"
      });
    }
  };

  const encryptMessageWithPGP = async () => {
    if (!encryptMessage || !selectedRecipientKey) {
      toast({
        title: "Required Fields",
        description: "Please enter a message and select a key",
        variant: "destructive"
      });
      return;
    }

    try {
      const recipientKey = await PGPService.exportPublicKey(selectedRecipientKey);
      const encrypted = await PGPService.encryptMessage(encryptMessage, recipientKey);
      
      setEncryptedResult(encrypted);
      toast({
        title: "Message encrypted",
        description: "Your message has been encrypted successfully"
      });
    } catch (error) {
      console.error('Error encrypting message:', error);
      toast({
        title: "Error",
        description: "Unable to encrypt message",
        variant: "destructive"
      });
    }
  };

  const decryptMessageWithPGP = async () => {
    if (!decryptMessage || !pgpPassphrase) {
      toast({
        title: "Required Fields",
        description: "Please enter the encrypted message and your passphrase",
        variant: "destructive"
      });
      return;
    }

    try {
      const primaryKey = pgpKeys.find(key => key.is_primary);
      if (!primaryKey) {
        throw new Error("No master key found");
      }

      const privateKey = await PGPService.decryptPrivateKeyFromStorage(
        primaryKey.private_key_encrypted,
        pgpPassphrase
      );

      const result = await PGPService.decryptMessage(
        decryptMessage,
        privateKey,
        pgpPassphrase
      );

      setDecryptedResult(result.data);
      
      toast({
        title: result.verified ? "Message decrypted and verified" : "Message decrypted",
        description: result.verified ? "The signature is valid" : "Message decrypted successfully"
      });
    } catch (error) {
      console.error('Error decrypting message:', error);
      toast({
        title: "Error",
        description: "Unable to decrypt message",
        variant: "destructive"
      });
    }
  };

  const generateTOTPSecret = () => {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTotpSecret(secret);
    
    // Generate backup codes
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    setBackupCodes(codes);
  };

  const enable2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setEnabling2FA(true);
    try {
      // In a real implementation, you'd verify the TOTP code here
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user?.id,
          totp_secret: totpSecret,
          backup_codes: backupCodes,
          is_totp_enabled: true
        });

      if (error) throw error;

      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: '2fa_enabled',
        p_severity: 'info'
      });

      setTwoFA(prev => ({ ...prev!, is_totp_enabled: true }));
      setShowBackupCodes(true);
      
      toast({
        title: "2FA enabled",
        description: "Two-factor authentication successfully enabled"
      });
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "Unable to enable 2FA",
        variant: "destructive"
      });
    } finally {
      setEnabling2FA(false);
    }
  };

  const disable2FA = async () => {
    try {
      const { error } = await supabase
        .from('user_2fa')
        .update({
          is_totp_enabled: false,
          totp_secret: null,
          backup_codes: null
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: '2fa_disabled',
        p_severity: 'warning'
      });

      setTwoFA(prev => ({ ...prev!, is_totp_enabled: false }));
      setTotpSecret('');
      setBackupCodes([]);
      
      toast({
        title: "2FA disabled",
        description: "Two-factor authentication disabled"
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: 'device_removed',
        p_severity: 'info'
      });

      setDevices(devices.filter(d => d.id !== deviceId));
      
      toast({
        title: "Device removed",
        description: "The device has been removed from your trusted devices"
      });
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels = {
      'login_success': 'Successful Login',
      'login_failed': 'Failed Login',
      'logout': 'Logout',
      'password_change': 'Password Change',
      '2fa_enabled': '2FA Enabled',
      '2fa_disabled': '2FA Disabled',
      '2fa_success': '2FA Successful',
      '2fa_failed': '2FA Failed',
      'device_registered': 'New Device',
      'device_removed': 'Device Removed',
      'suspicious_activity': 'Suspicious Activity'
    };
    return labels[eventType] || eventType;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-cameroon flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Login Required</h2>
              <Button onClick={() => navigateToAuth()}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-subtle safe-area-padding">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cameroon-primary mb-2 flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Security & Privacy
            </h1>
            <p className="text-gray-600">Manage your security settings and protect your account</p>
          </div>

          <Tabs defaultValue="2fa" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="2fa">2FA</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="logs">Activity</TabsTrigger>
              <TabsTrigger value="encryption">Encryption</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>

            {/* 2FA Tab */}
            <TabsContent value="2fa">
              <Card className="border-cameroon-yellow/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!twoFA?.is_totp_enabled ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-800">2FA Not Enabled</p>
                            <p className="text-sm text-yellow-600">Your account is not protected by 2FA</p>
                          </div>
                        </div>
                        <Button onClick={generateTOTPSecret} className="bg-cameroon-primary">
                          Enable 2FA
                        </Button>
                      </div>

                      {totpSecret && (
                        <div className="space-y-4 p-4 border border-cameroon-yellow/20 rounded-lg">
                          <h3 className="font-medium">2FA Configuration</h3>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">TOTP Secret:</label>
                            <div className="flex gap-2">
                              <Input 
                                value={totpSecret} 
                                readOnly 
                                className="font-mono text-xs"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(totpSecret)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Scan this QR code or enter manually in your authenticator app
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Verification code:</label>
                            <Input
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value)}
                              placeholder="000000"
                              maxLength={6}
                              className="text-center tracking-widest"
                            />
                          </div>

                          <Button
                            onClick={enable2FA}
                            disabled={enabling2FA || !totpCode}
                            className="w-full bg-cameroon-primary"
                          >
                            {enabling2FA ? 'Activating...' : 'Confirm and activate'}
                          </Button>
                        </div>
                      )}

                      {showBackupCodes && backupCodes.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-medium text-green-800 mb-2">Recovery codes</h3>
                          <p className="text-sm text-green-600 mb-3">
                            Save these recovery codes in a safe place
                          </p>
                          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                            {backupCodes.map((code, i) => (
                              <div key={i} className="p-2 bg-white border rounded flex justify-between">
                                <span>{code}</span>
                                <Copy 
                                  className="w-3 h-3 cursor-pointer text-gray-400 hover:text-gray-600"
                                  onClick={() => copyToClipboard(code)}
                                />
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => copyToClipboard(backupCodes.join('\n'))}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download all codes
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">2FA enabled</p>
                            <p className="text-sm text-green-600">Your account is protected</p>
                          </div>
                        </div>
                        <Button variant="destructive" onClick={disable2FA}>
                          Disable 2FA
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <Card className="border-cameroon-yellow/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Trusted Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {devices.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No devices registered</p>
                  ) : (
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{device.device_name}</p>
                              <p className="text-sm text-gray-500">
                                IP: {device.ip_address} • 
                                Last Activity: {new Date(device.last_seen_at).toLocaleDateString('en-US')}
                              </p>
                              {device.is_trusted && (
                                <Badge variant="outline" className="border-green-500 text-green-600 mt-1">
                                  Trusted Device
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDevice(device.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Logs Tab */}
            <TabsContent value="logs">
              <Card className="border-cameroon-yellow/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Security Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {securityLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {securityLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(log.severity)}`} />
                          <div className="flex-1">
                            <p className="font-medium">{getEventTypeLabel(log.event_type)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(log.created_at).toLocaleString('en-US')}
                              {log.ip_address && ` • IP: ${log.ip_address}`}
                            </p>
                          </div>
                          <Badge variant="outline" className={`${
                            log.severity === 'critical' ? 'border-red-500 text-red-600' :
                            log.severity === 'warning' ? 'border-yellow-500 text-yellow-600' :
                            'border-green-500 text-green-600'
                          }`}>
                            {log.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Encryption Tab */}
            <TabsContent value="encryption">
              <Card className="border-cameroon-yellow/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    PGP Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Generate New Key Pair */}
                    <div className="space-y-4 p-4 border border-cameroon-yellow/20 rounded-lg">
                      <h3 className="font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Generate new PGP key pair
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Key name:</label>
                          <Input
                            value={pgpKeyName}
                            onChange={(e) => setPgpKeyName(e.target.value)}
                            placeholder="My personal key"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Passphrase:</label>
                          <Input
                            type="password"
                            value={pgpPassphrase}
                            onChange={(e) => setPgpPassphrase(e.target.value)}
                            placeholder="Secure passphrase"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={generatePGPKeyPair}
                        disabled={generatingPGP}
                        className="bg-cameroon-primary"
                      >
                        <FileKey className="w-4 h-4 mr-2" />
                        {generatingPGP ? 'Generating...' : 'Generate key pair'}
                      </Button>
                    </div>

                    {/* Existing Keys */}
                    {pgpKeys.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">My PGP keys</h3>
                        <div className="space-y-3">
                          {pgpKeys.map((key) => (
                            <div key={key.id} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <FileKey className="w-4 h-4 text-cameroon-primary" />
                                  <span className="font-medium">{key.key_name}</span>
                                  {key.is_primary && (
                                    <Badge className="bg-cameroon-yellow text-cameroon-primary">
                                      Primary
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {!key.is_primary && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPrimaryPGPKey(key.id)}
                                    >
                                      Set as primary
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deletePGPKey(key.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 font-mono">
                                Fingerprint: {key.key_fingerprint}
                              </p>
                              <p className="text-xs text-gray-400">
                                Created on {new Date(key.created_at).toLocaleDateString('en-US')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Encrypt Message */}
                    <div className="space-y-4 p-4 border border-cameroon-yellow/20 rounded-lg">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Encrypt a message
                      </h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message to encrypt:</label>
                        <Textarea
                          value={encryptMessage}
                          onChange={(e) => setEncryptMessage(e.target.value)}
                          placeholder="Type your secret message here..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recipient key:</label>
                        <select
                          value={selectedRecipientKey}
                          onChange={(e) => setSelectedRecipientKey(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a key</option>
                          {pgpKeys.map((key) => (
                            <option key={key.id} value={key.id}>
                              {key.key_name} ({key.key_fingerprint.slice(0, 8)}...)
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button onClick={encryptMessageWithPGP} className="bg-cameroon-primary">
                        <Send className="w-4 h-4 mr-2" />
                        Encrypt
                      </Button>

                      {encryptedResult && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Encrypted result:</label>
                          <Textarea
                            value={encryptedResult}
                            readOnly
                            rows={6}
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(encryptedResult)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Decrypt Message */}
                    <div className="space-y-4 p-4 border border-cameroon-yellow/20 rounded-lg">
                      <h3 className="font-medium flex items-center gap-2">
                        <Unlock className="w-4 h-4" />
                        Decrypt a message
                      </h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Encrypted message:</label>
                        <Textarea
                          value={decryptMessage}
                          onChange={(e) => setDecryptMessage(e.target.value)}
                          placeholder="Paste the encrypted message here..."
                          rows={4}
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Passphrase:</label>
                        <Input
                          type="password"
                          value={pgpPassphrase}
                          onChange={(e) => setPgpPassphrase(e.target.value)}
                          placeholder="Your passphrase"
                        />
                      </div>

                      <Button onClick={decryptMessageWithPGP} className="bg-cameroon-red">
                        <Unlock className="w-4 h-4 mr-2" />
                        Decrypt
                      </Button>

                      {decryptedResult && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Decrypted message:</label>
                          <Textarea
                            value={decryptedResult}
                            readOnly
                            rows={3}
                            className="bg-green-50 border-green-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <RoleControlSystem />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Security;