/**
 * XML file handler
 * Translates XML files while preserving structure and attributes
 */

import fs from 'fs-extra';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates an XML file
 * @param {string} inputPath - Path to input XML file
 * @param {string} outputPath - Path to output XML file
 * @param {Object} config - Translator configuration
 */
export async function translateXmlFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing XML file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');

  // Parse XML
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: false,
    format: true,
    commentPropName: '#comment'
  });

  const data = parser.parse(fileContent);

  // Collect translatable values
  const translations = [];
  collectTranslatableValues(data, translations);

  if (translations.length === 0) {
    console.log('⚠️  No translatable content found');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, fileContent, 'utf-8');
    return;
  }

  console.log(`📝 Found ${translations.length} text nodes to translate`);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Translation Progress |{bar}| {percentage}% | {value}/{total} nodes',
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

      // Build XML from data
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: '    ',
        suppressEmptyNode: false
      });

      const xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(data);

      // Write current state to file
      await fs.writeFile(outputPath, xmlOutput, 'utf-8');

      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating text node: ${error.message}`);
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}

/**
 * Recursively collects all translatable string values from XML data
 * @param {*} obj - Current object/value being processed
 * @param {Array} translations - Array to collect translations
 * @param {Object} parent - Parent object reference
 * @param {string} key - Key in parent object
 */
function collectTranslatableValues(obj, translations, parent = null, key = null) {
  if (typeof obj === 'string') {
    // Only translate non-empty strings that aren't just whitespace
    if (obj.trim().length > 0 && parent && key) {
      translations.push({ value: obj, ref: parent, key });
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      // Skip attributes (they start with @)
      if (!k.startsWith('@') && k !== '#comment') {
        collectTranslatableValues(v, translations, obj, k);
      }
    }
  }
}
