const { AttachmentBuilder } = require('discord.js')
const Cipher = require('./Cipher')
const idKey = Symbol()
var msgCache = {}
class Volume {
    #cipher
    #tree
    constructor(channel, cipher, chunkSize = 10485760) {
        this.channel = channel
        this.#cipher = cipher
        this.chunkSize = chunkSize
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
        return await this.#cipher.decrypt(Buffer.concat(await Promise.all(obj.map(async url=>Buffer.from(await (await fetch(url)).arrayBuffer())))))
    }
    readFileStream(path) {
        //
    }
    async makeFile(path, data) {
        if (!Buffer.isBuffer(data)) data = Buffer.from(data);
        var newFile = path.pop();
        var obj = this.#tree
        for (let key of path) {
            obj = obj?.[key]
            if (!obj) throw new Error("invalid path at " + key);
        }
        if (Array.isArray(obj)) throw new Error(path.at(-1) + " is a file");
        if (obj[newFile]) throw new Error("item already exists");
        var file = await this.channel.send('```' + await this.#cipher.encode(newFile) + '```')
        await file.startThread({
            name: await this.#cipher.encode("FILE", 76),
            autoArchiveDuration: 60,
        });
        msgCache[file.id] = file
        data = await this.#cipher.encrypt(data)
        var temp = []
        for (let i = 0; i < data.length; i += this.chunkSize) {
            temp.push((await file.thread.send({ files: [new AttachmentBuilder(data.subarray(i, i + this.chunkSize), { name: 'data' })] })).attachments.first().url)//add as attachment  
        }
        await msgCache[obj[idKey]].thread.send('```' + await this.#cipher.encode(file.id) + '```')
        obj[newFile] = temp
        obj[newFile][idKey] = file.id
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
        if (obj[newFolder]) throw new Error("item already exists");
        var folder = await this.channel.send('```' + await this.#cipher.encode(newFolder) + '```')
        folder.startThread({
            name: await this.#cipher.encode("FOLDER", 76),
            autoArchiveDuration: 60,
        });
        msgCache[folder.id] = folder
        await msgCache[obj[idKey]].thread.send('```' + await this.#cipher.encode(folder.id) + '```')
        obj[newFolder] = {[idKey]: folder.id}
    }
    async rename(path, name) {
        var obj = this.#tree
        var item = path.pop();
        for (let key of path) {
            obj = obj?.[key]
            if (!obj) throw new Error("invalid path at " + key);
        }
        if (!obj[item]) throw new Error("invalid path at " + item);
        if (obj[name]) throw new Error("item already exists");
        await msgCache[obj[item][idKey]].edit('```' + await this.#cipher.encode(String(name)) + '```')
        obj[name] = obj[item]
        delete obj[item]
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