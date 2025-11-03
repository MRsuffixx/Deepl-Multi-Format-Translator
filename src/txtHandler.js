/**
 * TXT file handler
 * Translates text files line by line while preserving empty lines
 */

import fs from 'fs-extra';
import path from 'path';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates a TXT file
 * @param {string} inputPath - Path to input TXT file
 * @param {string} outputPath - Path to output TXT file
 * @param {Object} config - Translator configuration
 */
export async function translateTxtFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing TXT file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);

  // Filter lines that need translation
  const translatableLines = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.trim().length > 0);

  if (translatableLines.length === 0) {
    console.log('⚠️  No translatable content found');
    // Still create output file with original content
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, fileContent, 'utf-8');
    return;
  }

  console.log(`📝 Found ${translatableLines.length} lines to translate`);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Translation Progress |{bar}| {percentage}% | {value}/{total} lines',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(translatableLines.length, 0);

  // Translate each line and write incrementally
  const translatedLines = [...lines];
  for (let i = 0; i < translatableLines.length; i++) {
    const { line, index } = translatableLines[i];
    try {
      const translated = await translateText(line, config);
      translatedLines[index] = translated;
      
      // Write current state to file after each translation
      const output = translatedLines.join('\n');
      await fs.writeFile(outputPath, output, 'utf-8');
      
      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating line ${index + 1}: ${error.message}`);
      // Keep original line on error
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}
