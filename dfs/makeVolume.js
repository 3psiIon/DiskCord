var Volume = require("./Volume.js");
module.exports = async function makeVolume(cipher, guildID, name) {
    const guild = await this.client.guilds.fetch(guildID);
    const channel = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
    });
    return new Volume(channel, cipher);
};