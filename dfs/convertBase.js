module.exports = function convertBase(str, fromBase, toBase) {
    const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/-\\=.,;:!?%&$#@*~_`'\"|[](){}<>^ ";
    const digitsIndex = {};
    for (let i = 0; i < digits.length; i++) {
        digitsIndex[digits[i]] = i;
    }
    let number = 0n;
    for (let i = 0; i < str.length; i++) {
        number = number * BigInt(fromBase) + BigInt(digitsIndex[str[i]]);
    }
    if (number === 0n) {
        return digits[0].repeat(str.length);
    }
    let res = "";
    while (number > 0n) {
        res = digits[Number(number % BigInt(toBase))] + res;
        number = number / BigInt(toBase);
    }
    let leadingZeros = 0;
    while (leadingZeros < str.length && digitsIndex[str[leadingZeros]] === 0) {
        leadingZeros++;
    }
    return digits[0].repeat(leadingZeros) + res;
};