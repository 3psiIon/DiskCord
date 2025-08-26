const { ThreadChannel } = require('discord.js')
const convertBase = require('./convertBase.js')
const idKey = Symbol()
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
    async readFile(path) {
        var obj = this.#tree
        for (let key of path) {
            obj = obj?.[key]
            if (!obj) throw new Error("invalid path at " + key);
        }
        if (!Array.isArray(obj)) throw new Error(path.at(-1) + " is a folder");
        return Buffer.concat(await Promise.all(obj.map(async url=>Buffer.from(await (await fetch(url)).arrayBuffer()))))
    }
    readFileStream(path) {
        //
    }
    makeFile(path, data) {
        //
    }
    makeFileStream(path, data) {
        //
    }
    async makeFolder(path) {
        var newFolder = path.pop();
        var obj = this.#tree
        for (let key of path) {
            obj = obj?.[key]
            if (!obj) throw new Error("invalid path at " + key);
        }
        if (Array.isArray(obj)) throw new Error(path.at(-1) + " is a file");
        var folder = await this.channel.send('```' + await this.#cipher.encode(newFolder) + '```')
        folder.startThread({
            name: await this.#cipher.encode("FOLDER", 76),
            autoArchiveDuration: 60,
        });
        await msgCache[obj[idKey]].thread.send('```' + await this.#cipher.encode(folder.id) + '```')
        obj[newFolder] = {[idKey]: folder.id}
    }
    rename(path, name) {
        //
    }
    delete(path) {
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
            var name = await cipher.decode(msg.content.slice(3, -3))
            return [name, await load(msg.id, cipher)]
        })))
    }
    res[idKey] = id
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
    if (typeof obj != 'object') return obj;
    if (Array.isArray(obj)) return;
    var res = {}
    for (const key in obj) {
        res[key] = frozenClone(obj[key]);
    }
    Object.freeze(res)
    return res
}
module.exports = Volume;