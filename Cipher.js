const util = require("util");
const crypto = require("crypto");
const zlib = require("zlib");
const convertBase = require("./convertBase.js");
const deflateAsync = util.promisify(zlib.deflate);
const inflateAsync = util.promisify(zlib.inflate);
class Cipher {
    #isKey;
    #secret;
    constructor(key) {
        this.#isKey = Buffer.isBuffer(key) && key.length === 32
        this.#secret = this.#isKey ? key : String(key);
    }
    async encrypt(data) {
        var ks = this.#isKey ? [this.#secret, Buffer.alloc(0)] : await pswd2Key(this.#secret);
        let compressed = await deflateAsync(data);
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv("aes-256-gcm", ks[0], iv);
        const encrypted = Buffer.concat([
            cipher.update(compressed),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([ks[1], iv, encrypted, tag])
    };
    encryptStream() {
        //
    }
    async decrypt(data) {
        if (!this.#isKey) {
            var sSalt = data.subarray(0, 16);
            data = data.subarray(16);
            var key = (await pswd2Key(this.#secret, sSalt))[0];
        }else {
            var key = this.#secret
        }
        const iv = data.subarray(0, 12);
        const tag = data.subarray(data.length - 16);
        const encrypted = data.subarray(12, data.length - 16);
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        return await inflateAsync(Buffer.concat([decipher.update(encrypted), decipher.final()]));
    };
    async encode(data, base = 190) {
        return convertBase((await this.encrypt(data)).toString('hex').toUpperCase(), 16, base)
    }
    async decode(data, base = 190) {
        return String(await this.decrypt(Buffer.from(convertBase(data, base, 16), 'hex')))
    }
    decryptStream() {
        //
    }
}
function pswd2Key(key, salt = crypto.randomBytes(16)) {
    return new Promise((resolve) => {
        crypto.scrypt(
            key,
            salt,
            32,
            { N: 2 ** 14, r: 8, p: 4 },
            (err, derivedKey) => {
                resolve([derivedKey, salt]);
            }
        );
    });
}
module.exports = Cipher;