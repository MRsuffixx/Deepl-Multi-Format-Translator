/**
 * Utility functions for text processing and placeholder protection
 * Handles Minecraft formatting codes and variable placeholders
 */

/**
 * Patterns to protect from translation
 * These include Minecraft color codes, formatting codes, and variable placeholders
 */
const PROTECTED_PATTERNS = [
  // Minecraft color codes: &0-9, &a-f, &r (reset), &l (bold), &m (strikethrough), &n (underline), &o (italic), &k (obfuscated)
  /&[0-9a-fk-or]/gi,
  // Variable placeholders: %s, %d, %f, etc.
  /%[sdfioxXeEgGcpn]/g,
  // Named placeholders: {player}, {amount}, etc.
  /\{[^}]+\}/g,
  // Double percentage (escaped)
  /%%/g,
];

/**
 * Protects special formatting codes by replacing them with placeholders
 * @param {string} text - Original text with formatting codes
 * @returns {Object} - { text: sanitized text, map: placeholder mapping }
 */
export function protectPlaceholders(text) {
  if (!text || typeof text !== 'string') {
    return { text: text || '', map: [] };
  }

  let protectedText = text;
  const placeholderMap = [];
  let placeholderIndex = 0;

  // Process each pattern type
  PROTECTED_PATTERNS.forEach((pattern) => {
    const matches = [...protectedText.matchAll(pattern)];
    
    matches.forEach((match) => {
      const original = match[0];
      const placeholder = `[[PROTECTED_${placeholderIndex}]]`;
      
      // Store the mapping
      placeholderMap.push({
        placeholder,
        original,
        index: placeholderIndex
      });
      
      // Replace first occurrence (to handle duplicates correctly)
      protectedText = protectedText.replace(original, placeholder);
      placeholderIndex++;
    });
  });

  return {
    text: protectedText,
    map: placeholderMap
  };
}

/**
 * Restores original formatting codes from placeholders
 * @param {string} text - Translated text with placeholders
 * @param {Array} map - Placeholder mapping from protectPlaceholders
 * @returns {string} - Text with restored formatting codes
 */
export function restorePlaceholders(text, map) {
  if (!text || typeof text !== 'string' || !map || map.length === 0) {
    return text || '';
  }

  let restoredText = text;

  // Restore placeholders in reverse order to avoid conflicts
  [...map].reverse().forEach(({ placeholder, original }) => {
    restoredText = restoredText.replace(placeholder, original);
  });

  return restoredText;
}

/**
 * Validates if a string needs translation
 * @param {string} text - Text to validate
 * @returns {boolean} - True if text should be translated
 */
export function shouldTranslate(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Don't translate empty strings or whitespace-only strings
  if (text.trim().length === 0) {
    return false;
  }

  // Don't translate strings that are only formatting codes
  const { text: protectedText } = protectPlaceholders(text);
  if (protectedText.trim().length === 0) {
    return false;
  }

  return true;
}

/**
 * Delays execution for retry logic
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates environment configuration
 * @param {Object} env - Environment variables
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateConfig(env) {
  const errors = [];

  if (!env.DEEPL_API_KEY) {
    errors.push('DEEPL_API_KEY is required');
  }

  if (!env.SOURCE_LANG) {
    errors.push('SOURCE_LANG is required');
  }

  if (!env.TARGET_LANG) {
    errors.push('TARGET_LANG is required');
  }

  if (!env.INPUT_DIR) {
    errors.push('INPUT_DIR is required');
  }

  if (!env.OUTPUT_DIR) {
    errors.push('OUTPUT_DIR is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
