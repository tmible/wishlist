/** @typedef {import('telegraf').Context} Context */

/**
 * Проверка, является ли чат групповым
 * @function isChatGroup
 * @param {Context} ctx Контекст
 * @returns {boolean} Признак того, что чат являетс групповым
 */
const isChatGroup = (ctx) => ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';

export default isChatGroup;
