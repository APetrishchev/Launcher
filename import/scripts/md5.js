export function md5(str) {

  const rotateLeft = function(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits))
  }

  const addUnsigned = function (lX, lY) {
    const l8 = (lX & 0x80000000) ^ (lY & 0x80000000)
    const lX4 = (lX & 0x40000000)
    const lY4 = (lY & 0x40000000)
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
    if (lX4 & lY4) {
      return lResult^0x80000000^l8 }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult^0xC0000000^l8
      } else {
        return lResult^0x40000000^l8 }
    }
    else {
      return lResult^l8 }
  }

  const fn1 = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(((b&c)|((~b)&d)), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const fn2 = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(((b&d)|(c&(~d))), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const fn3 = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(b^c^d, x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const fn4 = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(c^(b|(~d)), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  const convertToWordArray = function (str) {
    let lWordCount
    const lMessageLength = str.length
    const lNumberOfWordsTemp = lMessageLength + 8
    const lNumberOfWords = ((lNumberOfWordsTemp - (lNumberOfWordsTemp % 64)) / 64 + 1) * 16
    const lWordArray = Array(lNumberOfWords - 1)
    let lBytePosition
    let lByteCount = 0
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition))
      lByteCount++
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4
    lBytePosition = (lByteCount % 4) * 8
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition)
    lWordArray[lNumberOfWords-2] = lMessageLength<<3
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29
    return lWordArray
  }

  const wordToHex = function (lValue) {
    let wordToHexValue = "", wordToHexValueTemp = ""
    for (let lCount = 0; lCount <= 3; lCount++) {
      let lByte = (lValue>>>(lCount*8)) & 255
      wordToHexValueTemp = "0" + lByte.toString(16)
      wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length-2, 2)
    }
    return wordToHexValue
  }

  let aa, bb, cc, dd, a, b, c, d
  const s11 = 7, s12 = 12, s13 = 17, s14 = 22
  const s21 = 5, s22 = 9 , s23 = 14, s24 = 20
  const s31 = 4, s32 = 11, s33 = 16, s34 = 23
  const s41 = 6, s42 = 10, s43 = 15, s44 = 21

  const x = convertToWordArray(unescape(encodeURIComponent(str)))
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476

  for (let k = 0; k < x.length; k += 16) {
    aa = a; bb = b; cc = c; dd = d
    a = fn1(a, b, c, d, x[k + 0], s11, 0xD76AA478)
    d = fn1(d, a, b, c, x[k + 1], s12, 0xE8C7B756)
    c = fn1(c, d, a, b, x[k + 2], s13, 0x242070DB)
    b = fn1(b, c, d, a, x[k + 3], s14, 0xC1BDCEEE)
    a = fn1(a, b, c, d, x[k + 4], s11, 0xF57C0FAF)
    d = fn1(d, a, b, c, x[k + 5], s12, 0x4787C62A)
    c = fn1(c, d, a, b, x[k + 6], s13, 0xA8304613)
    b = fn1(b, c, d, a, x[k + 7], s14, 0xFD469501)
    a = fn1(a, b, c, d, x[k + 8], s11, 0x698098D8)
    d = fn1(d, a, b, c, x[k + 9], s12, 0x8B44F7AF)
    c = fn1(c, d, a, b, x[k + 10], s13, 0xFFFF5BB1)
    b = fn1(b, c, d, a, x[k + 11], s14, 0x895CD7BE)
    a = fn1(a, b, c, d, x[k + 12], s11, 0x6B901122)
    d = fn1(d, a, b, c, x[k + 13], s12, 0xFD987193)
    c = fn1(c, d, a, b, x[k + 14], s13, 0xA679438E)
    b = fn1(b, c, d, a, x[k + 15], s14, 0x49B40821)
    a = fn2(a, b, c, d, x[k + 1], s21, 0xF61E2562)
    d = fn2(d, a, b, c, x[k + 6], s22, 0xC040B340)
    c = fn2(c, d, a, b, x[k + 11], s23, 0x265E5A51)
    b = fn2(b, c, d, a, x[k + 0], s24, 0xE9B6C7AA)
    a = fn2(a, b, c, d, x[k + 5], s21, 0xD62F105D)
    d = fn2(d, a, b, c, x[k + 10], s22, 0x2441453)
    c = fn2(c, d, a, b, x[k + 15], s23, 0xD8A1E681)
    b = fn2(b, c, d, a, x[k + 4], s24, 0xE7D3FBC8)
    a = fn2(a, b, c, d, x[k + 9], s21, 0x21E1CDE6)
    d = fn2(d, a, b, c, x[k + 14], s22, 0xC33707D6)
    c = fn2(c, d, a, b, x[k + 3], s23, 0xF4D50D87)
    b = fn2(b, c, d, a, x[k + 8], s24, 0x455A14ED)
    a = fn2(a, b, c, d, x[k + 13], s21, 0xA9E3E905)
    d = fn2(d, a, b, c, x[k + 2], s22, 0xFCEFA3F8)
    c = fn2(c, d, a, b, x[k + 7], s23, 0x676F02D9)
    b = fn2(b, c, d, a, x[k + 12], s24, 0x8D2A4C8A)
    a = fn3(a, b, c, d, x[k + 5], s31, 0xFFFA3942)
    d = fn3(d, a, b, c, x[k + 8], s32, 0x8771F681)
    c = fn3(c, d, a, b, x[k + 11], s33, 0x6D9D6122)
    b = fn3(b, c, d, a, x[k + 14], s34, 0xFDE5380C)
    a = fn3(a, b, c, d, x[k + 1], s31, 0xA4BEEA44)
    d = fn3(d, a, b, c, x[k + 4], s32, 0x4BDECFA9)
    c = fn3(c, d, a, b, x[k + 7], s33, 0xF6BB4B60)
    b = fn3(b, c, d, a, x[k + 10], s34, 0xBEBFBC70)
    a = fn3(a, b, c, d, x[k + 13], s31, 0x289B7EC6)
    d = fn3(d, a, b, c, x[k + 0], s32, 0xEAA127FA)
    c = fn3(c, d, a, b, x[k + 3], s33, 0xD4EF3085)
    b = fn3(b, c, d, a, x[k + 6], s34, 0x4881D05)
    a = fn3(a, b, c, d, x[k + 9], s31, 0xD9D4D039)
    d = fn3(d, a, b, c, x[k + 12], s32, 0xE6DB99E5)
    c = fn3(c, d, a, b, x[k + 15], s33, 0x1FA27CF8)
    b = fn3(b, c, d, a, x[k + 2], s34, 0xC4AC5665)
    a = fn4(a, b, c, d, x[k + 0], s41, 0xF4292244)
    d = fn4(d, a, b, c, x[k + 7], s42, 0x432AFF97)
    c = fn4(c, d, a, b, x[k + 14], s43, 0xAB9423A7)
    b = fn4(b, c, d, a, x[k + 5], s44, 0xFC93A039)
    a = fn4(a, b, c, d, x[k + 12], s41, 0x655B59C3)
    d = fn4(d, a, b, c, x[k + 3], s42, 0x8F0CCC92)
    c = fn4(c, d, a, b, x[k + 10], s43, 0xFFEFF47D)
    b = fn4(b, c, d, a, x[k + 1], s44, 0x85845DD1)
    a = fn4(a, b, c, d, x[k + 8], s41, 0x6FA87E4F)
    d = fn4(d, a, b, c, x[k + 15], s42, 0xFE2CE6E0)
    c = fn4(c, d, a, b, x[k + 6], s43, 0xA3014314)
    b = fn4(b, c, d, a, x[k + 13], s44, 0x4E0811A1)
    a = fn4(a, b, c, d, x[k + 4], s41, 0xF7537E82)
    d = fn4(d, a, b, c, x[k + 11], s42, 0xBD3AF235)
    c = fn4(c, d, a, b, x[k + 2], s43, 0x2AD7D2BB)
    b = fn4(b, c, d, a, x[k + 9], s44, 0xEB86D391)
    a = addUnsigned(a, aa)
    b = addUnsigned(b, bb)
    c = addUnsigned(c, cc)
    d = addUnsigned(d, dd)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}
