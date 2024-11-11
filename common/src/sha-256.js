/**
 * Вычисление SHA-256 хеша указанного значения
 * @function sha256
 * @param {string} value Хешируемое значение
 * @returns {Promise<string>} Вычисленный хеш
 * @async
 */
const sha256 = async (value) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(
    new Uint8Array(hashBuffer),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('');
};

export default sha256;
