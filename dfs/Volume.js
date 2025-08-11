class Volume {
    #cipher
    constructor(channel, cipher) {
        this.channel = channel
        this.#cipher = cipher
    }
}
module.exports = Volume;