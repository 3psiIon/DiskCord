const Volume = require('./Volume.js');
const { ChannelType } = require('discord.js');
class Bot {
    constructor(client) {
        this.client = client
    }
    async getVolume(cipher, channelID) {
        const channel = await this.client.channels.fetch(channelID);
        return await new Volume(channel, cipher).init()
    }
    async makeVolume(cipher, guildID, name) {
        const guild = await this.client.guilds.fetch(guildID);
        const channel = await guild.channels.create({
            name,
            type: ChannelType.GuildText,
        });
        await (await channel.send('```' + await cipher.encode('') + '```')).startThread({
            name: await cipher.encode("ROOT", 76),
            autoArchiveDuration: 60,
        });
        return await new Volume(channel, cipher).init();
    };
}
module.exports = Bot;