/**
 * TOML file handler
 * Translates TOML files while preserving structure and comments
 */

import fs from 'fs-extra';
import path from 'path';
import toml from 'toml';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates a TOML file
 * @param {string} inputPath - Path to input TOML file
 * @param {string} outputPath - Path to output TOML file
 * @param {Object} config - Translator configuration
 */
export async function translateTomlFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing TOML file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');

  // Parse TOML
  const data = toml.parse(fileContent);

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

      // Convert back to TOML
      const tomlOutput = stringifyToml(data);

      // Write current state to file
      await fs.writeFile(outputPath, tomlOutput, 'utf-8');

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
 * Recursively collects all translatable string values from TOML data
 * @param {*} obj - Current object/value being processed
 * @param {Array} translations - Array to collect translations
 * @param {Object} parent - Parent object reference
 * @param {string} key - Key in parent object
 */
function collectTranslatableValues(obj, translations, parent = null, key = null) {
  if (typeof obj === 'string') {
    if (obj.trim().length > 0 && parent && key) {
      translations.push({ value: obj, ref: parent, key });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      collectTranslatableValues(item, translations, obj, index);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      collectTranslatableValues(v, translations, obj, k);
    }
  }
}

/**
 * Converts a JavaScript object to TOML format
 * @param {Object} obj - Object to convert
 * @param {string} prefix - Current section prefix
 * @returns {string} - TOML formatted string
 */
function stringifyToml(obj, prefix = '') {
  let result = '';
  const sections = {};
  const values = {};

  // Separate values and nested objects
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sections[key] = value;
    } else {
      values[key] = value;
    }
  }

  // Write values first
  for (const [key, value] of Object.entries(values)) {
    result += `${key} = ${formatTomlValue(value)}\n`;
  }

  // Write sections
  for (const [key, value] of Object.entries(sections)) {
    const sectionName = prefix ? `${prefix}.${key}` : key;
    result += `\n[${sectionName}]\n`;
    result += stringifyToml(value, sectionName);
  }

  return result;
}

/**
 * Formats a value for TOML output
 * @param {*} value - Value to format
 * @returns {string} - Formatted value
 */
function formatTomlValue(value) {
  if (typeof value === 'string') {
    // Escape quotes and backslashes
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  } else if (Array.isArray(value)) {
    return '[' + value.map(formatTomlValue).join(', ') + ']';
  } else if (value === null) {
    return 'null';
  }
  return String(value);
}
