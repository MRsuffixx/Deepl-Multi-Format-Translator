#!/usr/bin/env node

/**
 * DeepL Translation Bot - Main Entry Point
 * Automatically translates multiple file formats using DeepL API
 */

import dotenv from 'dotenv';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateConfig } from './utils.js';
import { createConfig } from './translator.js';
import { translateYamlFile } from './yamlHandler.js';
import { translateJsonFile } from './jsonHandler.js';
import { translateTxtFile } from './txtHandler.js';
import { translateSnbtFile } from './snbtHandler.js';
import { translatePropertiesFile } from './propertiesHandler.js';
import { translateIniFile } from './iniHandler.js';
import { translateXmlFile } from './xmlHandler.js';
import { translateTomlFile } from './tomlHandler.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.yaml', '.yml', '.json', '.txt', '.snbt', '.properties', '.ini', '.xml', '.toml'];

/**
 * Main application function
 */
async function main() {
  try {
    // Display banner
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║   DeepL Translation Bot                           ║');
    console.log('║   Multi-Format File Translator                    ║');
    console.log('║   YAML • JSON • TXT • SNBT • XML • TOML • INI     ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    // Validate configuration
    const configValidation = validateConfig(process.env);
    if (!configValidation.valid) {
      console.error('❌ Configuration Error:');
      configValidation.errors.forEach(error => console.error(`   - ${error}`));
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      console.error('   You can use .env.example as a template.\n');
      process.exit(1);
    }

    // Get input/output directories from environment
    const inputDir = path.resolve(process.env.INPUT_DIR);
    const outputDir = path.resolve(process.env.OUTPUT_DIR);

    // Ensure input directory exists
    if (!await fs.pathExists(inputDir)) {
      console.error(`❌ Input directory not found: ${inputDir}`);
      console.error('💡 Please create the directory and add files to translate.\n');
      process.exit(1);
    }

    // Scan for translatable files
    console.log(`📂 Scanning directory: ${inputDir}\n`);
    const files = await scanForTranslatableFiles(inputDir);

    if (files.length === 0) {
      console.log('⚠️  No translatable files found.');
      console.log(`💡 Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}\n`);
      process.exit(0);
    }

    console.log(`✅ Found ${files.length} translatable file(s)\n`);

    // Let user select a file
    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: 'Select a file to translate:',
        choices: files.map(file => ({
          name: `${file.name} (${file.ext})`,
          value: file
        })),
        pageSize: 15
      }
    ]);

    // Confirm translation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Translate "${selectedFile.name}" from ${process.env.SOURCE_LANG} to ${process.env.TARGET_LANG}?`,
        default: true
      }
    ]);

    if (!confirm) {
      console.log('\n❌ Translation cancelled.\n');
      process.exit(0);
    }

    // Create translator configuration
    const translatorConfig = createConfig(process.env);

    // Determine output path
    const inputPath = selectedFile.path;
    const relativePath = path.relative(inputDir, inputPath);
    const outputPath = path.join(outputDir, relativePath);

    // Translate based on file type
    const startTime = Date.now();

    switch (selectedFile.ext) {
      case '.yaml':
      case '.yml':
        await translateYamlFile(inputPath, outputPath, translatorConfig);
        break;
      case '.json':
        await translateJsonFile(inputPath, outputPath, translatorConfig);
        break;
      case '.txt':
        await translateTxtFile(inputPath, outputPath, translatorConfig);
        break;
      case '.snbt':
        await translateSnbtFile(inputPath, outputPath, translatorConfig);
        break;
      case '.properties':
        await translatePropertiesFile(inputPath, outputPath, translatorConfig);
        break;
      case '.ini':
        await translateIniFile(inputPath, outputPath, translatorConfig);
        break;
      case '.xml':
        await translateXmlFile(inputPath, outputPath, translatorConfig);
        break;
      case '.toml':
        await translateTomlFile(inputPath, outputPath, translatorConfig);
        break;
      default:
        console.error(`❌ Unsupported file type: ${selectedFile.ext}`);
        process.exit(1);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total time: ${duration}s`);
    console.log(`📁 Output saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

/**
 * Scans directory for translatable files
 * @param {string} dir - Directory to scan
 * @returns {Promise<Array>} - Array of file objects
 */
async function scanForTranslatableFiles(dir) {
  const files = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push({
            name: entry.name,
            path: fullPath,
            ext: ext,
            relativePath: path.relative(dir, fullPath)
          });
        }
      }
    }
  }

  await scan(dir);
  return files;
}

// Run the application
main();
