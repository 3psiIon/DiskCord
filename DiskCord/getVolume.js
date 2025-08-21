const Volume = require('./Volume.js')
module.exports = async function getVolume(cipher, channelID) {
    const channel = await this.client.channels.fetch(channelID);
    return await new Volume(channel, cipher).init()
}