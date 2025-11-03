/**
 * INI file handler
 * Translates .ini files while preserving sections, keys, and comments
 */

import fs from 'fs-extra';
import path from 'path';
import ini from 'ini';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates an INI file
 * @param {string} inputPath - Path to input INI file
 * @param {string} outputPath - Path to output INI file
 * @param {Object} config - Translator configuration
 */
export async function translateIniFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing INI file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');
  
  // Parse INI
  const data = ini.parse(fileContent);

  // Collect translatable values
  const translations = [];
  collectTranslatableValues(data, translations);

  if (translations.length === 0) {
    console.log('⚠️  No translatable content found');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, fileContent, 'utf-8');
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

      // Write current state to file
      const iniOutput = ini.stringify(data);
      await fs.writeFile(outputPath, iniOutput, 'utf-8');

      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating "${item.value}": ${error.message}`);
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}

/**
 * Recursively collects all translatable string values from INI data
 * @param {*} obj - Current object/value being processed
 * @param {Array} translations - Array to collect translations
 * @param {Object} parent - Parent object reference
 * @param {string} key - Key in parent object
 */
function collectTranslatableValues(obj, translations, parent = null, key = null) {
  if (typeof obj === 'string') {
    if (obj.trim().length > 0) {
      translations.push({ value: obj, ref: parent, key });
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      collectTranslatableValues(v, translations, obj, k);
    }
  }
}
