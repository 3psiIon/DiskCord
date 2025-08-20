const { Client } = require('discord.js');
const Bot = require('./Bot.js');
module.exports = function loadBot(token) {
    return new Promise((resolve, reject) => {
        let client = new Client({
            intents: []
        });
        client.login(token).catch(reject)
        client.once('ready', async () => {
            resolve(new Bot(client));
        });
    });
}
