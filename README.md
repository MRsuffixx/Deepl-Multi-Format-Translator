# 🌍 DeepL Translation Bot

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

**A powerful, multi-format file translation tool powered by DeepL API**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Supported Formats](#-supported-file-formats) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

DeepL Translation Bot is a command-line Node.js application that automatically translates localization files across **8 different formats** using the DeepL API. Perfect for game developers, server administrators, and localization teams who need to maintain translations across multiple file formats while preserving structure, formatting, and special codes.

### 🎯 Key Highlights

- **8 File Formats**: YAML, JSON, TXT, SNBT, Properties, INI, XML, TOML
- **Minecraft Support**: Preserves color codes, formatting, and placeholders
- **Real-time Progress**: Watch translations update incrementally
- **Smart Preservation**: Maintains file structure, comments, and special syntax
- **Error Recovery**: Automatic retries with exponential backoff
- **Interactive CLI**: Easy file selection and confirmation

---

## ✨ Features

### 🌐 Multi-Format Support
Translate files in 8 different formats:
- **YAML/YML** - Configuration files with nested structures
- **JSON** - API responses, config files, data structures
- **TXT** - Plain text, documentation, help files
- **SNBT** - Minecraft NBT data (items, entities, blocks)
- **Properties** - Java properties files
- **INI** - Configuration files with sections
- **XML** - Structured data with attributes
- **TOML** - Modern configuration format

### 🎮 Minecraft Integration
Perfect for Minecraft server administrators and plugin developers:
- Preserves color codes (`&a`, `&c`, `&6`, etc.)
- Maintains format codes (`&l`, `&o`, `&r`, etc.)
- Protects placeholders (`{player}`, `{amount}`, `{world}`)
- Keeps variables (`%s`, `%d`, `%f`)
- Handles SNBT data for custom items and entities

### 🚀 Advanced Features
- **Incremental Writing**: See translations appear in real-time
- **Progress Tracking**: Visual progress bars for each file
- **Automatic Retry**: Handles rate limits and network errors
- **Structure Preservation**: Maintains exact file structure and formatting
- **Comment Preservation**: Keeps comments in supported formats
- **Batch Processing**: Translate multiple files in sequence
- **Recursive Scanning**: Finds files in subdirectories

---

## 📋 Requirements

- **Node.js** v14.0.0 or higher
- **DeepL API Key** (free or pro)
  - Get your free API key at [DeepL API](https://www.deepl.com/pro-api)
  - Free tier: 500,000 characters/month

---

## 🚀 Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/MRsuffixx/TranslatorBot.git
cd TranslatorBot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your DeepL API key

# Run the translator
npm start
```

### Detailed Setup

1. **Clone or Download**
   ```bash
   git clone https://github.com/MRsuffixx/TranslatorBot.git
   cd TranslatorBot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   
   This installs:
   - `dotenv` - Environment configuration
   - `inquirer` - Interactive CLI
   - `yaml` - YAML parsing
   - `fast-xml-parser` - XML parsing
   - `toml` - TOML parsing
   - `ini` - INI parsing
   - `properties-reader` - Properties parsing
   - `cli-progress` - Progress bars
   - `fs-extra` - Enhanced file operations
   - `node-fetch` - HTTP requests

3. **Configure Environment**
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DEEPL_API_KEY=your_api_key_here
   SOURCE_LANG=EN
   TARGET_LANG=TR
   INPUT_DIR=./to_translate
   OUTPUT_DIR=./translated
   ```

4. **Verify Installation**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# DeepL API Configuration
DEEPL_API_KEY=your_deepl_api_key_here

# Language Settings
SOURCE_LANG=EN          # Source language code
TARGET_LANG=TR          # Target language code

# Directory Configuration
INPUT_DIR=./to_translate    # Where to find files to translate
OUTPUT_DIR=./translated     # Where to save translated files
```

### Supported Languages

#### Source Languages
`EN`, `DE`, `FR`, `ES`, `IT`, `NL`, `PL`, `PT`, `RU`, `JA`, `ZH`, `BG`, `CS`, `DA`, `EL`, `ET`, `FI`, `HU`, `ID`, `LT`, `LV`, `RO`, `SK`, `SL`, `SV`, `TR`, `UK`

#### Target Languages
`EN-US`, `EN-GB`, `DE`, `FR`, `ES`, `IT`, `NL`, `PL`, `PT-PT`, `PT-BR`, `RU`, `JA`, `ZH`, `BG`, `CS`, `DA`, `EL`, `ET`, `FI`, `HU`, `ID`, `LT`, `LV`, `RO`, `SK`, `SL`, `SV`, `TR`, `UK`

See [DeepL API Documentation](https://www.deepl.com/docs-api/translate-text/) for the complete list.

---

## 📖 Usage

### Basic Workflow

1. **Add Files to Translate**
   ```bash
   # Place your files in the to_translate directory
   cp your-file.yml to_translate/
   ```

2. **Run the Translator**
   ```bash
   npm start
   ```

3. **Select File**
   - Use arrow keys to navigate
   - Press Enter to select
   - Confirm translation

4. **Get Results**
   - Translated files appear in `translated/` directory
   - Original files remain unchanged
   - Watch real-time progress

### Example Session

```
╔═══════════════════════════════════════════════════╗
║   DeepL Translation Bot                           ║
║   Multi-Format File Translator                    ║
║   YAML • JSON • TXT • SNBT • XML • TOML • INI     ║
╚═══════════════════════════════════════════════════╝

✅ Configuration validated
📂 Found 5 translatable files

? Select a file to translate: (Use arrow keys)
❯ config.yml
  messages.json
  help.txt
  item.snbt
  server.properties

? Translate config.yml from EN to TR? (Y/n) Y

📄 Processing YAML file: config.yml
📝 Found 24 values to translate
Translation Progress |████████████████████| 100% | 24/24 values
✅ Translation complete: config.yml

⏱️  Total time: 12.34s
📁 Output saved to: translated/config.yml
```

---

## 📁 Supported File Formats

### 1. YAML (.yaml, .yml)

**Use Cases**: Configuration files, localization, data serialization

**Input**:
```yaml
server:
  name: "Epic Minecraft Server"
  motd: "&6Welcome &bto &aour &cserver!"
messages:
  welcome: "Welcome, {player}!"
  goodbye: "See you later!"
```

**Output**:
```yaml
server:
  name: "Epik Minecraft Sunucusu"
  motd: "&6Hoş geldiniz &bsunucumuza!"
messages:
  welcome: "Hoş geldin, {player}!"
  goodbye: "Sonra görüşürüz!"
```

**Features**:
- ✅ Preserves nested structure
- ✅ Maintains key names
- ✅ Keeps comments
- ✅ Handles arrays and objects

---

### 2. JSON (.json)

**Use Cases**: API data, configuration, data exchange

**Input**:
```json
{
  "welcome": "Welcome to the server!",
  "player": {
    "join": "{player} joined the game",
    "leave": "{player} left the game"
  },
  "errors": {
    "notFound": "Player %s not found"
  }
}
```

**Output**:
```json
{
  "welcome": "Sunucuya hoş geldiniz!",
  "player": {
    "join": "{player} oyuna katıldı",
    "leave": "{player} oyundan ayrıldı"
  },
  "errors": {
    "notFound": "Oyuncu %s bulunamadı"
  }
}
```

**Features**:
- ✅ Recursive translation
- ✅ Preserves structure
- ✅ Maintains formatting
- ✅ Handles nested objects

---

### 3. TXT (.txt)

**Use Cases**: Documentation, help files, plain text

**Input**:
```txt
Welcome to our Minecraft server!
Use /help to see available commands.
Have fun playing!
```

**Output**:
```txt
Minecraft sunucumuza hoş geldiniz!
Mevcut komutları görmek için /help kullanın.
İyi eğlenceler!
```

**Features**:
- ✅ Line-by-line translation
- ✅ Preserves empty lines
- ✅ Maintains line breaks
- ✅ Simple and fast

---

### 4. SNBT (.snbt)

**Use Cases**: Minecraft items, entities, blocks, data packs

**Input**:
```snbt
{
  display: {
    Name: "{\"text\":\"&6Legendary Sword\",\"italic\":false}",
    Lore: [
      "{\"text\":\"&7A powerful weapon\",\"italic\":false}",
      "{\"text\":\"&cDamage: %s\",\"italic\":false}"
    ]
  },
  Enchantments: [
    {id: "minecraft:sharpness", lvl: 5}
  ],
  description: "Forged by {player}"
}
```

**Output**:
```snbt
{
  display: {
    Name: "{\"text\":\"&6Efsanevi Kılıç\",\"italic\":false}",
    Lore: [
      "{\"text\":\"&7Güçlü bir silah\",\"italic\":false}",
      "{\"text\":\"&cHasar: %s\",\"italic\":false}"
    ]
  },
  Enchantments: [
    {id: "minecraft:sharpness", lvl: 5}
  ],
  description: "{player} tarafından dövülmüş"
}
```

**Features**:
- ✅ Preserves NBT syntax
- ✅ Translates quoted strings only
- ✅ Maintains Minecraft codes
- ✅ Keeps structure intact

---

### 5. Properties (.properties)

**Use Cases**: Java applications, Minecraft plugins, configuration

**Input**:
```properties
# Server Configuration
server.welcome=Welcome to our server!
server.motd=&6Best &bMinecraft &aServer
player.join={player} has joined the game
error.permission=&cYou don't have permission!
```

**Output**:
```properties
# Server Configuration
server.welcome=Sunucumuza hoş geldiniz!
server.motd=&6En İyi &bMinecraft &aSunucusu
player.join={player} oyuna katıldı
error.permission=&cİzniniz yok!
```

**Features**:
- ✅ Preserves comments
- ✅ Maintains key names
- ✅ Handles special characters
- ✅ Keeps formatting

---

### 6. INI (.ini)

**Use Cases**: Configuration files, settings

**Input**:
```ini
[Server]
name=Epic Minecraft Server
description=The best server for adventures!

[Messages]
welcome=Welcome, {player}!
goodbye=See you later!

[Errors]
no_permission=You don't have permission
```

**Output**:
```ini
[Server]
name=Epik Minecraft Sunucusu
description=Maceralar için en iyi sunucu!

[Messages]
welcome=Hoş geldin, {player}!
goodbye=Sonra görüşürüz!

[Errors]
no_permission=İzniniz yok
```

**Features**:
- ✅ Preserves sections
- ✅ Maintains structure
- ✅ Handles comments
- ✅ Keeps key names

---

### 7. XML (.xml)

**Use Cases**: Configuration, data exchange, structured data

**Input**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<localization>
    <messages>
        <welcome>Welcome to our server!</welcome>
        <goodbye>Thanks for playing!</goodbye>
    </messages>
    <player>
        <join>{player} joined the game</join>
        <leave>{player} left the game</leave>
    </player>
</localization>
```

**Output**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<localization>
    <messages>
        <welcome>Sunucumuza hoş geldiniz!</welcome>
        <goodbye>Oynadığınız için teşekkürler!</goodbye>
    </messages>
    <player>
        <join>{player} oyuna katıldı</join>
        <leave>{player} oyundan ayrıldı</leave>
    </player>
</localization>
```

**Features**:
- ✅ Preserves XML structure
- ✅ Maintains attributes
- ✅ Handles nested elements
- ✅ Keeps formatting

---

### 8. TOML (.toml)

**Use Cases**: Modern configuration, Rust projects, Hugo sites

**Input**:
```toml
[server]
name = "Epic Minecraft Server"
description = "The best place for adventures!"

[messages]
welcome = "Welcome, {player}!"
goodbye = "See you next time!"

[player.death]
pvp = "{player} was slain by {killer}"
fall = "{player} fell from a high place"
```

**Output**:
```toml
[server]
name = "Epik Minecraft Sunucusu"
description = "Maceralar için en iyi yer!"

[messages]
welcome = "Hoş geldin, {player}!"
goodbye = "Bir dahaki sefere görüşürüz!"

[player.death]
pvp = "{player}, {killer} tarafından öldürüldü"
fall = "{player} yüksek bir yerden düştü"
```

**Features**:
- ✅ Preserves sections
- ✅ Maintains structure
- ✅ Handles nested tables
- ✅ Keeps data types

---

## 🎮 Minecraft Formatting Codes

The translator automatically detects and preserves all Minecraft formatting:

### Color Codes
| Code | Color | Code | Color |
|------|-------|------|-------|
| `&0` | Black | `&8` | Dark Gray |
| `&1` | Dark Blue | `&9` | Blue |
| `&2` | Dark Green | `&a` | Green |
| `&3` | Dark Aqua | `&b` | Aqua |
| `&4` | Dark Red | `&c` | Red |
| `&5` | Dark Purple | `&d` | Light Purple |
| `&6` | Gold | `&e` | Yellow |
| `&7` | Gray | `&f` | White |

### Format Codes
- `&k` - Obfuscated
- `&l` - Bold
- `&m` - Strikethrough
- `&n` - Underline
- `&o` - Italic
- `&r` - Reset

### Placeholders
- **Variables**: `%s`, `%d`, `%f`, `%1$s`, etc.
- **Named**: `{player}`, `{amount}`, `{world}`, `{killer}`, etc.
- **Custom**: Any text in curly braces `{custom_placeholder}`

---

## 🔧 Advanced Features

### Incremental Writing

Files are written incrementally as translations complete:
- **Real-time updates**: Watch files update in your editor
- **Crash recovery**: Never lose completed translations
- **Progress visibility**: See results immediately
- **Large file friendly**: No need to wait for everything to finish

### Automatic Retry Logic

Smart error handling with exponential backoff:
- **Initial delay**: 1 second
- **Maximum delay**: 10 seconds
- **Max retries**: 3 attempts
- **Rate limit handling**: Automatic backoff
- **Network errors**: Graceful recovery

### Progress Tracking

Visual feedback for every translation:
```
Translation Progress |████████████████████| 100% | 45/45 values
```
- Real-time progress bar
- Current/total items
- Percentage complete
- Time estimation

### Structure Preservation

Maintains exact file structure:
- **Indentation**: Preserved exactly
- **Comments**: Kept in place
- **Formatting**: Maintained
- **Special syntax**: Protected

---

## 📁 Project Structure

```
TranslatorBot/
├── src/
│   ├── main.js              # Entry point & CLI
│   ├── translator.js        # DeepL API integration
│   ├── yamlHandler.js       # YAML processor
│   ├── jsonHandler.js       # JSON processor
│   ├── txtHandler.js        # TXT processor
│   ├── snbtHandler.js       # SNBT processor
│   ├── propertiesHandler.js # Properties processor
│   ├── iniHandler.js        # INI processor
│   ├── xmlHandler.js        # XML processor
│   ├── tomlHandler.js       # TOML processor
│   └── utils.js             # Utility functions
├── to_translate/            # Input directory
│   └── (sample files)       # Example files
├── translated/              # Output directory (auto-created)
├── memory-bank/             # Documentation
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

---

## 🐛 Troubleshooting

### Configuration Errors

**Error**: `DEEPL_API_KEY is required`
- **Solution**: Create `.env` file and add your API key
- **Check**: File is named `.env` (not `.env.txt`)
- **Verify**: API key is correct and active

**Error**: `Input directory not found`
- **Solution**: Create the directory: `mkdir to_translate`
- **Check**: Path in `.env` matches actual directory
- **Verify**: Permissions allow directory access

### API Errors

**Error**: `DeepL API error (403)`
- **Solution**: Verify API key is valid
- **Check**: Using correct endpoint (free vs pro)
- **Verify**: API key has not expired

**Error**: `Rate limit exceeded`
- **Solution**: Wait for automatic retry
- **Check**: Free tier monthly limit (500k chars)
- **Consider**: Upgrading to Pro plan

### Translation Issues

**Issue**: Formatting codes not preserved
- **Check**: Codes are inside translatable text
- **Verify**: Using supported format (`&a`, `%s`, `{player}`)
- **Review**: `utils.js` placeholder patterns

**Issue**: File structure changed
- **Check**: Original file had valid syntax
- **Verify**: No special characters breaking parser
- **Review**: Handler-specific requirements

### Performance Issues

**Issue**: Slow translation
- **Cause**: Network latency, API response time
- **Solution**: Normal for large files
- **Tip**: Use incremental writing to see progress

**Issue**: High memory usage
- **Cause**: Large files loaded in memory
- **Solution**: Split large files into smaller ones
- **Tip**: Process files individually

---

## 📚 Documentation

### Additional Resources

- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide
- **[SNBT_SUPPORT.md](SNBT_SUPPORT.md)** - Minecraft SNBT details
- **[INCREMENTAL_WRITING.md](INCREMENTAL_WRITING.md)** - How incremental writing works
- **[memory-bank/](memory-bank/)** - Technical documentation

### API Documentation

- [DeepL API Docs](https://www.deepl.com/docs-api)
- [Supported Languages](https://www.deepl.com/docs-api/translate-text/)
- [API Limits](https://www.deepl.com/pro-api)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues
- Use GitHub Issues
- Provide clear description
- Include error messages
- Share sample files (if possible)

### Suggesting Features
- Open a GitHub Issue
- Describe the feature
- Explain use case
- Provide examples

### Pull Requests
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Setup
```bash
git clone https://github.com/MRsuffixx/TranslatorBot.git
cd TranslatorBot
npm install
cp .env.example .env
# Add your API key to .env
npm start
```

---

## 📄 License

MIT License

Copyright (c) 2024 MRsuffixx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

### Built With
- **[DeepL API](https://www.deepl.com/pro-api)** - Translation service
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)** - Interactive CLI
- **[yaml](https://github.com/eemeli/yaml)** - YAML parser
- **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)** - XML parser
- **[toml](https://github.com/BinaryMuse/toml-node)** - TOML parser
- **[ini](https://github.com/npm/ini)** - INI parser
- **[properties-reader](https://github.com/steveukx/properties)** - Properties parser
- **[cli-progress](https://github.com/npkgz/cli-progress)** - Progress bars
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)** - File operations
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment configuration

### Special Thanks
- DeepL for providing excellent translation API
- The Minecraft community for inspiration
- All contributors and users

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MRsuffixx/TranslatorBot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MRsuffixx/TranslatorBot/discussions)
- **Email**: Create an issue for support

---

## 🗺️ Roadmap

### Planned Features
- [ ] Batch translation mode
- [ ] Custom placeholder patterns
- [ ] Translation memory/cache
- [ ] Multiple target languages at once
- [ ] Web interface
- [ ] Docker support
- [ ] More file formats (CSV, Markdown, etc.)
- [ ] Translation validation
- [ ] Diff view for changes

### Version History
- **v2.0.0** - Added Properties, INI, XML, TOML support
- **v1.1.0** - Added SNBT support and incremental writing
- **v1.0.0** - Initial release with YAML, JSON, TXT support

---

<div align="center">

**Made with ❤️ for the Minecraft and localization communities**

[⬆ Back to Top](#-deepl-translation-bot)

</div>
