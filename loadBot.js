const { Client } = require('discord.js');
const Bot = require('./Bot.js');
module.exports = function loadBot(token, intents = []) {
    if (token.constructor.name === 'Client') {
        return new Bot(client)
    }
    return new Promise((resolve, reject) => {
        let client = new Client({
            intents: [...intents]
        });
        client.login(token).catch(reject)
        client.once('ready', async () => {
            resolve(new Bot(client));
        });
    });
}
