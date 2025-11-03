/**
 * JSON file handler
 * Parses, translates, and saves JSON files while preserving structure
 */

import fs from 'fs-extra';
import path from 'path';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates a JSON file
 * @param {string} inputPath - Path to input JSON file
 * @param {string} outputPath - Path to output JSON file
 * @param {Object} config - Translator configuration
 */
export async function translateJsonFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing JSON file: ${path.basename(inputPath)}`);

  // Read and parse JSON file
  const fileContent = await fs.readFile(inputPath, 'utf-8');
  const data = JSON.parse(fileContent);

  // Collect all translatable values
  const translations = [];
  collectTranslatableValues(data, translations);

  if (translations.length === 0) {
    console.log('⚠️  No translatable content found');
    return;
  }

  console.log(`📝 Found ${translations.length} values to translate`);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Translation Progress |{bar}| {percentage}% | {value}/{total} values',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(translations.length, 0);

  // Translate each value and write incrementally
  for (let i = 0; i < translations.length; i++) {
    const item = translations[i];
    try {
      const translated = await translateText(item.value, config);
      item.ref[item.key] = translated;
      
      // Write current state to file after each translation
      const jsonOutput = JSON.stringify(data, null, 2);
      await fs.writeFile(outputPath, jsonOutput, 'utf-8');
      
      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating "${item.value}": ${error.message}`);
      // Keep original value on error
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}

/**
 * Recursively collects all translatable string values from JSON data
 * @param {*} obj - Current object/value being processed
 * @param {Array} translations - Array to collect translations
 * @param {Object} parent - Parent object reference
 * @param {string} key - Key in parent object
 */
function collectTranslatableValues(obj, translations, parent = null, key = null) {
  if (typeof obj === 'string' && obj.trim().length > 0) {
    // This is a translatable string value
    if (parent && key !== null) {
      translations.push({
        value: obj,
        ref: parent,
        key: key
      });
    }
  } else if (Array.isArray(obj)) {
    // Process array elements
    obj.forEach((item, index) => {
      collectTranslatableValues(item, translations, obj, index);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    // Process object properties
    for (const [k, v] of Object.entries(obj)) {
      collectTranslatableValues(v, translations, obj, k);
    }
  }
}
