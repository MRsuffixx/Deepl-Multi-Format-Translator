/**
 * Properties file handler
 * Translates .properties files while preserving keys and comments
 */

import fs from 'fs-extra';
import path from 'path';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates a .properties file
 * @param {string} inputPath - Path to input .properties file
 * @param {string} outputPath - Path to output .properties file
 * @param {Object} config - Translator configuration
 */
export async function translatePropertiesFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing Properties file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);

  // Parse properties
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('!')) {
      entries.push({ type: 'comment', content: line, index: i });
      continue;
    }

    // Parse key=value
    const match = line.match(/^([^=:]+)[=:](.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      entries.push({ type: 'property', key, value, originalLine: line, index: i });
    } else {
      // Invalid line, keep as-is
      entries.push({ type: 'comment', content: line, index: i });
    }
  }

  // Filter translatable entries
  const translatableEntries = entries.filter(e => e.type === 'property' && e.value.length > 0);

  if (translatableEntries.length === 0) {
    console.log('⚠️  No translatable content found');
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, fileContent, 'utf-8');
    return;
  }

  console.log(`📝 Found ${translatableEntries.length} properties to translate`);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Translation Progress |{bar}| {percentage}% | {value}/{total} properties',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(translatableEntries.length, 0);

  // Translate each property and write incrementally
  for (let i = 0; i < translatableEntries.length; i++) {
    const entry = translatableEntries[i];
    try {
      const translated = await translateText(entry.value, config);
      entry.value = translated;

      // Rebuild file content
      const output = entries.map(e => {
        if (e.type === 'comment') {
          return e.content;
        } else {
          return `${e.key}=${e.value}`;
        }
      }).join('\n');

      // Write current state to file
      await fs.writeFile(outputPath, output, 'utf-8');

      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating "${entry.key}": ${error.message}`);
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}
