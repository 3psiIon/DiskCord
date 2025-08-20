class Bot {
    constructor(client) {
        this.client = client
        this.getVolume = require('./getVolume.js');
        this.makeVolume = require('./makeVolume.js');
    }
}
module.exports = Bot;