import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';

/**
 * @typedef {import('telegraf').Context} Context
 * @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 * @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus
 */

/**
 * Встроенная клавиатура для переключения содержимого сообщения на ссылку для групп
 * @constant {Markup<InlineKeyboardMarkup>}
 */
const LinkForGroupsMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Мне нужна ссылка для групп', 'link_for_groups'),
]);

/**
 * Встроенная клавиатура для переключения содержимого сообщения на ссылку на чат с ботом
 * @constant {Markup<InlineKeyboardMarkup>}
 */
const LinkForPrivateMarkup = Markup.inlineKeyboard([
  Markup.button.callback('Мне нужна ссылка на чат с ботом', 'link_for_private'),
]);

/**
 * Формирование ссылки
 * @function formLink
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @param {string} linkText Текст ссылки
 * @param {boolean} isLinkForGroups Признак формирования ссылки для групп
 * @returns {Promise<string | Format.FmtString>} Ссылка
 * @async
 */
const formLink = async (eventBus, ctx, linkText = '', isLinkForGroups = false) => {
  const hash = await eventBus.emit(Events.Usernames.GetUserHash, ctx.from.id);
  const link = `https://t.me/${
    ctx.botInfo.username
  }?start${isLinkForGroups ? 'group' : ''}=${hash}`;
  if (!!linkText && ctx.callbackQuery?.message.entities[0]?.type !== 'url') {
    return new Format.FmtString(
      linkText,
      [{ type: 'text_link', offset: 0, length: linkText.length, url: link }],
    );
  }
  return link;
};

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  inject(InjectionToken.Logger).debug('configuring link module');
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При вызове действия переключения содержимого сообщения на ссылку для групп или на чат с ботом
   * бот [формирует нужную ссылку]{@link formLink} и заменяет её в сообщении, сохраняя текст,
   * если он есть, и обновляя встроенную клавиатуру
   */
  bot.action(/^link_for_(groups|private)$/, async (ctx) => {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      undefined,
      await formLink(eventBus, ctx, ctx.callbackQuery.message.text, ctx.match[1] === 'groups'),
      ctx.match[1] === 'groups' ? LinkForPrivateMarkup : LinkForGroupsMarkup,
    );
  });

  /**
   * При получении команды /link бот [формирует ссылку на чат с ботом]{@link formLink}
   * и отправляет сообщение с ней и [встроенной клавиатурой для переключения содержимого сообщения
   * на ссылку для групп]{@link LinkForGroupsMarkup}
   */
  bot.command('link', async (ctx) => {
    await ctx.reply(await formLink(eventBus, ctx, ctx.payload), LinkForGroupsMarkup);
  });
};

export default { configure };
