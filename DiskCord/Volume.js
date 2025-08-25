const { ThreadChannel } = require('discord.js')
const convertBase = require('./convertBase.js')
const data = Symbol()
var msgCache = {}
class Volume {
    #cipher
    #tree
    constructor(channel, cipher) {
        this.channel = channel
        this.#cipher = cipher
    }
    async init() {
        this.#tree = (await getMsgs(this.channel)).at(-1).id
        this.#tree = await load(this.#tree, this.#cipher)
        this.init = undefined
        return this;
    }
    getTree() {
        return frozenClone(this.#tree)
    }
    readFile(file) {
        //
    }
    rename(item) {
        //
    }
}
async function load(id, cipher) {
    var res
    var isFile = await cipher.decode(msgCache[id].thread.name, 76) === "FILE"
    if (isFile) {
        res = [...(await getMsgs(msgCache[id].thread)).map(msg=>msg.attachments.first().url)].reverse()
    }else{
        res = Object.fromEntries(await Promise.all((await getMsgs(msgCache[id].thread)).map(async msg=>{
            msg = msgCache[await cipher.decode(msg.content.slice(3, -3))]
            return [await cipher.decode(msg.content.slice(3, -3)), await load(msg.id, cipher)]
        })))
    }
    res[data] = [isFile, id]
    return res
}
async function getMsgs(channel) {
    let res = []
    let lastId = null;
    const options = {
        limit: 100
    };
    while (true) {
        if (lastId) options.before = lastId;
        var msgs = (await channel.messages.fetch(options))
        if (msgs.size === 0) {
            break
        } else {
            lastId = msgs.last().id;
            msgs = msgs.filter(msg => msg.type === 0);
            Object.assign(msgCache, Object.fromEntries(msgs));
            res.push(...msgs.values())
        }
    }
    return res
}
function frozenClone(obj) {
    if (typeof obj != 'object') return obj
    var res
    if (Array.isArray(obj)) {
        res = []
    }else{
        res = {}
        for (const key in obj) {
            res[key] = frozenClone(obj[key]);
        }
    }
    res[data] = obj[data]
    Object.freeze(res)
    return res
}
module.exports = Volume;