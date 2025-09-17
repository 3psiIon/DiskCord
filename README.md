# DiskCord

[![npm version](https://img.shields.io/npm/v/diskcord   )](https://www.npmjs.com/package/diskcord)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Use Discord as a storage backend with files and folders in Node.js with encryption.

---

## Installation

```bash
npm i diskcord
```

---

## Usage

```js
const { Cipher, loadBot } = require("diskcord");

// Optional: pass intents for discord.js
const bot = await loadBot("YOUR_DISCORD_BOT_TOKEN", intents);

// Access the discord.js Client object
bot.client

// Can be a string, but for best performance use a 32-byte Buffer
// Save this value, otherwise you won't be able to decrypt files
const cipher = new Cipher("YOUR_PASSWORD_OR_KEY");

//Functions available for use but not necessary for regular usage
cipher.encrypt(data)
cipher.decrypt(data)

// guildID: ID of the Discord server
// name: name of the volume
// chunkSize: optional, in bytes (useful for servers with higher file size limits)
let volume = await bot.makeVolume(cipher, guildID, name, chunkSize);

// Access the discord.js channel object used for storage
volume.channel

// Load an existing volume if you already have one
// channelID: Discord channel ID of the volume
// You must use the same cipher the volume was created with
volume = await bot.getVolume(cipher, channelID, chunkSize);

// Returns an object representing the tree
let tree = volume.getTree(); 
// Call this again to refresh the structure

// Create a new file
// path: array representing the file path
// data: Buffer or anything convertible to Buffer
await volume.makeFile(path, data);

// Read a file
// Returns a Buffer
await volume.readFile(path);

// Create a new folder
await volume.makeFolder(path);

// Rename a file or folder
await volume.rename(path, name);

// Delete a file or folder
await volume.delete(path);