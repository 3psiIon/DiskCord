var Volume = require('./Volume.js')
module.exports = async function getVolume(channelID) {
    const channel = await this.client.channels.fetch(channelID);
    return new Volume(channel)
}