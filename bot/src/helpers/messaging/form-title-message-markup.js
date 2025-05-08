import { emit } from '@tmible/wishlist-common/event-bus';
import { Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';

/** @typedef {import('telegraf').Context} Context */
/** @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup */

/**
 * Формирование встроенной клавиатуры для заглавного сообщения списка желаний
 * @function formTitleMessageMarkup
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @returns {Markup<InlineKeyboardMarkup>[]} Встроенная клавиатура
 * @async
 */
const formTitleMessageMarkup = async (ctx, userid) => {
  let lastButton;

  if (userid !== ctx.chat.id) {
    const continueURI = `/add?wishlist=${await emit(Events.Usernames.GetUserHash, userid)}`;
    const addQuery = `?continue=${encodeURI(continueURI)}`;
    lastButton = Markup.button.login(
      'Добавить сюрприз',
      `https://wishlist.tmible.ru/api/authSuccess${userid === ctx.chat.id ? '' : addQuery}`,
    );
  }

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Обновить',
        userid === ctx.chat.id ? 'update_own_list' : `update_list ${userid}`,
      ),
    ],
    [
      Markup.button.callback(
        'Отправить новые сообщения',
        userid === ctx.chat.id ? 'force_own_list' : `force_list ${userid}`,
      ),
    ],
    ...(lastButton ? [[ lastButton ]] : []),
  ]);
};

export default formTitleMessageMarkup;
