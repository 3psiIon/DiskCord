const util = require("util");
const crypto = require("crypto");
const zlib = require("zlib");
const deflateAsync = util.promisify(zlib.deflate);
const inflateAsync = util.promisify(zlib.inflate);
class Cipher {
    #pswd;
    constructor(pswd) {
        this.#pswd = String(pswd)
    }
    encrypt = async function encrypt(data) {
        var ks = await pswd2Key(this.#pswd);
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
    decrypt = async function decrypt(data) {
        var sSalt = data.subarray(0, 16);
        data = data.subarray(16);
        let key = (await pswd2Key(this.#pswd, sSalt))[0];
        const iv = data.subarray(0, 12);
        const tag = data.subarray(data.length - 16);
        const encrypted = data.subarray(12, data.length - 16);
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);
        return await inflateAsync(Buffer.concat([decipher.update(encrypted), decipher.final()]));
    };
}
function pswd2Key(pswd, salt = crypto.randomBytes(16)) {
    return new Promise((resolve) => {
        crypto.scrypt(
            pswd,
            salt,
            32,
            { N: 2 ** 14, r: 14, p: 4 },
            (err, derivedKey) => {
                resolve([derivedKey, salt]);
            }
        );
    });
}
module.exports = Cipher;