/**
 * SNBT file handler
 * Translates Minecraft SNBT (Stringified NBT) files while preserving NBT syntax
 */

import fs from 'fs-extra';
import path from 'path';
import { translateText } from './translator.js';
import cliProgress from 'cli-progress';

/**
 * Translates an SNBT file
 * @param {string} inputPath - Path to input SNBT file
 * @param {string} outputPath - Path to output SNBT file
 * @param {Object} config - Translator configuration
 */
export async function translateSnbtFile(inputPath, outputPath, config) {
  console.log(`\n📄 Processing SNBT file: ${path.basename(inputPath)}`);

  // Read file content
  const fileContent = await fs.readFile(inputPath, 'utf-8');

  // Extract all quoted strings (translatable content)
  const translatableStrings = extractQuotedStrings(fileContent);

  if (translatableStrings.length === 0) {
    console.log('⚠️  No translatable content found');
    // Still create output file with original content
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, fileContent, 'utf-8');
    return;
  }

  console.log(`📝 Found ${translatableStrings.length} strings to translate`);

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Translation Progress |{bar}| {percentage}% | {value}/{total} strings',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(translatableStrings.length, 0);

  // Translate each string and write incrementally
  const translations = new Map();
  let translatedContent = fileContent;
  
  for (let i = 0; i < translatableStrings.length; i++) {
    const originalString = translatableStrings[i];
    
    // Skip if already translated (for duplicate strings)
    if (translations.has(originalString)) {
      progressBar.update(i + 1);
      continue;
    }

    try {
      // Extract the content without quotes
      const contentWithoutQuotes = originalString.slice(1, -1);
      
      // Only translate if there's actual content
      if (contentWithoutQuotes.trim().length > 0) {
        const translated = await translateText(contentWithoutQuotes, config);
        // Store with quotes
        const translatedString = `"${translated}"`;
        translations.set(originalString, translatedString);
        
        // Replace in content
        translatedContent = replaceAll(translatedContent, originalString, translatedString);
        
        // Write current state to file after each translation
        await fs.writeFile(outputPath, translatedContent, 'utf-8');
      } else {
        // Keep empty strings as-is
        translations.set(originalString, originalString);
      }
      
      progressBar.update(i + 1);
    } catch (error) {
      console.error(`\n❌ Error translating string ${i + 1}/${translatableStrings.length}:`, error.message);
      // Keep original string on error
      translations.set(originalString, originalString);
      progressBar.update(i + 1);
    }
  }

  progressBar.stop();

  console.log(`✅ Translation complete: ${path.basename(outputPath)}`);
}

/**
 * Extracts all quoted strings from SNBT content
 * Handles both single and double quotes, and escaped quotes
 * @param {string} content - SNBT file content
 * @returns {Array<string>} - Array of quoted strings (including quotes)
 */
function extractQuotedStrings(content) {
  const strings = [];
  const regex = /"(?:[^"\\]|\\.)*"/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    strings.push(match[0]);
  }
  
  return strings;
}

/**
 * Replaces all occurrences of a string with another
 * @param {string} str - Original string
 * @param {string} find - String to find
 * @param {string} replace - Replacement string
 * @returns {string} - String with replacements
 */
function replaceAll(str, find, replace) {
  // Escape special regex characters in the find string
  const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return str.replace(new RegExp(escapedFind, 'g'), replace);
}
