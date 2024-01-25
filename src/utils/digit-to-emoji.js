/**
 * Преобразование числа в эмодзи с числом
 * @function digitToEmoji
 * @param {number} digit Преобразуемое число
 * @returns {string} Эмодзи с числом
 */
const digitToEmoji = (digit) => {
  if (digit === 10) {
    return String.fromCodePoint(0x1F51F);
  }

  if (digit > 10) {
    return digit.toString().split('').map((digit) => digitToEmoji(parseInt(digit))).join('');
  }

  return String.fromCodePoint(0x0030 + digit, 0x20E3);
};

export default digitToEmoji;
