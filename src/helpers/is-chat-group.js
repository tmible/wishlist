/**
 * Проверка, является ли чат групповым
 * @function isChatGroup
 * @param {Context} ctx Контекст
 * @returns {boolean} признак того, что чат являетс групповым
 */
const isChatGroup = (ctx) => {
  return ctx.chat.type === 'group' || ctx.chat.type === 'supergroup';
};

export default isChatGroup;
