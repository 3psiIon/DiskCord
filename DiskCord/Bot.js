class Bot {
    constructor(client) {
        this.client = client
    }
}
Bot.prototype.getVolume = require('./getVolume.js');
Bot.prototype.makeVolume = require('./makeVolume.js');
module.exports = Bot;