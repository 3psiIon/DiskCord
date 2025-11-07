module.exports = function convertBase(str, fromBase, toBase, digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/-\\=.,;:!?%&$#@*~_`'\"|[](){}<>^ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ") {
    fromBase = BigInt(fromBase);
    toBase = BigInt(toBase);
    let leadingZeros = 0;
    const zeroChar = digits.charCodeAt(0);
    while (leadingZeros < str.length && str.charCodeAt(leadingZeros) === zeroChar) {
        leadingZeros++;
    }
    str = str.slice(leadingZeros);
    if (str.length === 0) {
        return digits[0].repeat(leadingZeros);
    }
    const digitIndex = [];
    const digitsLen = digits.length;
    for (let i = 0; i < digitsLen; i++) {
        digitIndex[digits.charCodeAt(i)] = BigInt(i);
    }
    const chunkSize = 1024;
    let number = 0n;
    const fromBasePowers = [1n];
    for (let i = 1; i <= chunkSize; i++) {
        fromBasePowers[i] = fromBasePowers[i - 1] * fromBase;
    }
    for (let i = 0; i < str.length; i += chunkSize) {
        const end = Math.min(i + chunkSize, str.length);
        const chunkLength = end - i;
        let chunkValue = 0n;
        for (let j = i; j < end; j++) {
            chunkValue = chunkValue * fromBase + digitIndex[str.charCodeAt(j)];
        }
        number = number * fromBasePowers[chunkLength] + chunkValue;
    }
    const res = [];
    while (number > 0n) {
        const remainder = Number(number % toBase);
        res.push(digits[remainder]);
        number = number / toBase;
    }

    return digits[0].repeat(leadingZeros) + res.reverse().join('');
}