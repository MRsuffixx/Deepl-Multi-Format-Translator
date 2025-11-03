/**
 * DeepL API translator module
 * Handles translation requests with retry logic and error handling
 */

import fetch from 'node-fetch';
import { protectPlaceholders, restorePlaceholders, shouldTranslate, delay } from './utils.js';

// DeepL Free API endpoint
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

/**
 * Translates a single text string using DeepL API
 * @param {string} text - Text to translate
 * @param {Object} config - Configuration object with API key and languages
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, config) {
  // Validate input
  if (!shouldTranslate(text)) {
    return text;
  }

  // Protect special formatting codes
  const { text: protectedText, map } = protectPlaceholders(text);

  // If nothing left to translate after protection, return original
  if (!shouldTranslate(protectedText)) {
    return text;
  }

  // Translate with retry logic
  const translatedText = await translateWithRetry(protectedText, config);

  // Restore formatting codes
  const restoredText = restorePlaceholders(translatedText, map);

  return restoredText;
}

/**
 * Translates text with automatic retry on failure
 * @param {string} text - Text to translate
 * @param {Object} config - Configuration object
 * @param {number} attempt - Current attempt number
 * @returns {Promise<string>} - Translated text
 */
async function translateWithRetry(text, config, attempt = 1) {
  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${config.apiKey}`
      },
      body: new URLSearchParams({
        text: text,
        source_lang: config.sourceLang,
        target_lang: config.targetLang
      })
    });

    // Handle rate limiting
    if (response.status === 429) {
      if (attempt <= MAX_RETRIES) {
        const retryDelay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
          MAX_RETRY_DELAY
        );
        console.warn(`Rate limited. Retrying in ${retryDelay}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
        await delay(retryDelay);
        return translateWithRetry(text, config, attempt + 1);
      } else {
        throw new Error('Max retries reached due to rate limiting');
      }
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`DeepL API error (${response.status}): ${errorBody}`);
    }

    // Parse response
    const data = await response.json();

    if (!data.translations || data.translations.length === 0) {
      throw new Error('No translation returned from DeepL API');
    }

    return data.translations[0].text;

  } catch (error) {
    // Retry on network errors
    if (attempt <= MAX_RETRIES && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
      const retryDelay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
        MAX_RETRY_DELAY
      );
      console.warn(`Network error. Retrying in ${retryDelay}ms... (Attempt ${attempt}/${MAX_RETRIES})`);
      await delay(retryDelay);
      return translateWithRetry(text, config, attempt + 1);
    }

    // Re-throw if max retries reached or non-retryable error
    throw error;
  }
}

/**
 * Translates an array of texts in batch
 * @param {Array<string>} texts - Array of texts to translate
 * @param {Object} config - Configuration object
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Array<string>>} - Array of translated texts
 */
export async function translateBatch(texts, config, onProgress = null) {
  const results = [];

  for (let i = 0; i < texts.length; i++) {
    try {
      const translated = await translateText(texts[i], config);
      results.push(translated);

      if (onProgress) {
        onProgress(i + 1, texts.length);
      }

      // Small delay to avoid overwhelming the API
      if (i < texts.length - 1) {
        await delay(100);
      }
    } catch (error) {
      console.error(`Error translating text ${i + 1}/${texts.length}:`, error.message);
      // Keep original text on error
      results.push(texts[i]);
    }
  }

  return results;
}

/**
 * Creates a translator configuration object from environment variables
 * @param {Object} env - Environment variables
 * @returns {Object} - Translator configuration
 */
export function createConfig(env) {
  return {
    apiKey: env.DEEPL_API_KEY,
    sourceLang: env.SOURCE_LANG,
    targetLang: env.TARGET_LANG
  };
}
