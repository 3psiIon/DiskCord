const convertBase = require('./convertBase.js')
var msgCache = {}
class Volume {
    #cipher
    constructor(channel, cipher) {
        this.channel = channel
        this.#cipher = cipher
        this.tree = {}
    }
    async init() {
        let lastId = null;
        const options = {
            limit: 100
        };
        while (true) {
            if (lastId) options.before = lastId;
            const msgs = await this.channel.messages.fetch(options);
            if (msgs.size === 0) {
                break
            } else {
                Object.assign(msgCache, Object.fromEntries(msgs));
                lastId = msgs.last().id;
            }
        }
        return this
    }
    test() {
        console.log(msgCache)
    }
}
module.exports = Volume;