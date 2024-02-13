/**
 * Получение ключа для хранения сессии конкретного чата среди остальных сессий
 * @function getSessionKey
 * @param {Context} ctx Контекст
 * @returns {number} Ключ сессии
 */
const getSessionKey = (ctx) => ctx.chat.id;

export default getSessionKey;
