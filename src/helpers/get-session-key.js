/**
 * Получение ключа для хранения сессии конкретного чата среди остальных сессий
 * @function getSessionKey
 * @param {Context} ctx Контекст
 * @returns {string} Ключ сессии
 */
const getSessionKey = (ctx) => ctx.chat.id.toString();

export default getSessionKey;
