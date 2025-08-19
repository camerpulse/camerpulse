/**
 * French Text Validation Utility
 * Enforces English-only content on CamerPulse platform
 */

const FRENCH_PATTERNS = {
  // French characters with accents
  accents: /[àâäéèêëîïôöùûüÿç]/i,
  
  // Common French words
  words: /\b(le|la|les|des|pour|dans|avec|sur|par|une|du|de|et|ou|où|qui|que|quoi|comment|pourquoi|quand|bonjour|salut|merci|bienvenue|connexion|inscription|mot de passe|nom d'utilisateur|recherche|accueil|profil|paramètres|déconnexion|français|francais)\b/i
};

/**
 * Validates that text contains no French content
 */
export function validateNoFrenchText(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  
  return !FRENCH_PATTERNS.accents.test(text) && !FRENCH_PATTERNS.words.test(text);
}

/**
 * Validates multiple text fields for French content
 */
export function validateTextFields(fields: Record<string, string>): { isValid: boolean; invalidFields: string[] } {
  const invalidFields: string[] = [];
  
  Object.entries(fields).forEach(([fieldName, value]) => {
    if (value && !validateNoFrenchText(value)) {
      invalidFields.push(fieldName);
    }
  });
  
  return {
    isValid: invalidFields.length === 0,
    invalidFields
  };
}

/**
 * Error message for French content detection
 */
export const FRENCH_CONTENT_ERROR = "Only English is allowed on CamerPulse. French content detected.";

/**
 * Sanitizes text by removing French content (basic approach)
 */
export function sanitizeFrenchContent(text: string): string {
  if (!text) return text;
  
  // Remove French accents by replacing with basic equivalents
  let sanitized = text
    .replace(/[àâä]/gi, 'a')
    .replace(/[éèêë]/gi, 'e')
    .replace(/[îï]/gi, 'i')
    .replace(/[ôö]/gi, 'o')
    .replace(/[ùûü]/gi, 'u')
    .replace(/[ÿ]/gi, 'y')
    .replace(/[ç]/gi, 'c');
  
  return sanitized;
}