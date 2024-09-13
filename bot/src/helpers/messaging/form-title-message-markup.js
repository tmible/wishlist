import { Markup } from 'telegraf';

/** @typedef {import('telegraf').Context} Context */
/** @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup */

/**
 * Формирование встроенной клавиатуры для заглавного сообщения списка желаний
 * @function formTitleMessageMarkup
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {Markup<InlineKeyboardMarkup>[]} Встроенная клавиатура
 */
const formTitleMessageMarkup = (ctx, userid) => Markup.inlineKeyboard([[
  Markup.button.callback(
    'Обновить',
    userid === ctx.chat.id ? 'update_own_list' : `update_list ${userid}`,
  ),
], [
  Markup.button.callback(
    'Отправить новые сообщения',
    userid === ctx.chat.id ? 'force_own_list' : `force_list ${userid}`,
  ),
]]);

export default formTitleMessageMarkup;
