/**
 * Вычисление SHA-256 хеша указанного значения
 * @function sha256Raw
 * @param {string} value Хешируемое значение
 * @returns {Promise<ArrayBuffer>} Вычисленный хеш в виде ArrayBuffer
 * @async
 */
export const sha256Raw = async (value) => await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(value),
);

/**
 * Вычисление SHA-256 хеша указанного значения
 * @function sha256
 * @param {string} value Хешируемое значение
 * @returns {Promise<string>} Вычисленный хеш в виде строки
 * @async
 */
export const sha256 = async (value) => Array.from(
  new Uint8Array(await sha256Raw(value)),
  (byte) => byte.toString(16).padStart(2, '0'),
).join('');

export default sha256;
