const { Client } = require('discord.js');
class Bot {
    constructor(client) {
        this.client = client
        this.getVolume = require('./getVolume.js');
    }
}
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
