import ListItemState from '@tmible/wishlist-common/constants/list-item-state';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { Format, Markup } from 'telegraf';
import Events from '@tmible/wishlist-bot/architecture/events';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import isChatGroup from '@tmible/wishlist-bot/helpers/is-chat-group';

/**
 * @typedef {
 *   import('@tmible/wishlist-bot/architecture/configure-modules').ModuleConfigureFunction
 * } ModuleConfigureFunction
 */
/** @typedef {import('telegraf').InlineKeyboardMarkup} InlineKeyboardMarkup */
/** @typedef {import('@tmible/wishlist-bot/store/editing/get-list').OwnListItem} OwnListItem */
/** @typedef {import('telegraf').Context} Context */
/** @typedef {import('@tmible/wishlist-common/event-bus').EventBus} EventBus */

/**
 * Подмножество состояний элемента списка, обозначающих наличие намерения подарить его
 * @constant {Set<ListItemState>}
 */
const PLANNED_PRESENTS_STATES = new Set([ ListItemState.BOOKED, ListItemState.COOPERATIVE ]);

/**
 * Встроенная клавиатура для сообщения с названем подарка для очистки списка
 * @constant {Markup<InlineKeyboardMarkup>}
 */
const LIST_CLEARING_MESSAGE_INLINE_KEYBOARD = Markup.inlineKeyboard([[
  Markup.button.callback('Нет', 'clear_list_no'),
  Markup.button.callback('Да', 'clear_list_yes'),
], [
  Markup.button.callback('Отменить очистку списка', 'clear_list_cancel'),
]]);

/**
 * Обработчик команды очистки списка
 * @function clearListCommandHandler
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const clearListCommandHandler = async (eventBus, ctx) => {
  if (isChatGroup(ctx)) {
    return;
  }

  const list = eventBus.emit(Events.Editing.GetList, ctx.from.id).sort((a, b) => {
    const isAPlanned = PLANNED_PRESENTS_STATES.has(a.state) ? 1 : 0;
    const isBPlanned = PLANNED_PRESENTS_STATES.has(b.state) ? 1 : 0;

    if (a.isExternal !== b.isExternal) {
      return b.isExternal - a.isExternal;
    }

    if (isAPlanned !== isBPlanned) {
      return isBPlanned - isAPlanned;
    }

    return a.id - b.id;
  });

  if (list.length === 0) {
    await ctx.reply('Ваш список пуст');
    return;
  }

  const promptMessage = await ctx.reply('Вам подарили');

  const { message_id } = await ctx.reply(
    new Format.FmtString(
      list[0].name,
      [{ offset: 0, length: list[0].name.length, type: 'bold' }],
    ),
    LIST_CLEARING_MESSAGE_INLINE_KEYBOARD,
  );

  ctx.session.listClearing = {
    list,
    listItemsToDeleteIds: [],
    messageId: message_id,
    promptMessageId: promptMessage.message_id,
  };
};

/**
 * Обработчик действий очистки списка
 * @function clearListActionsHandler
 * @param {EventBus} eventBus Шина событий
 * @param {Context} ctx Контекст
 * @returns {Promise<void>}
 * @async
 */
const clearListActionsHandler = async (eventBus, ctx) => {
  const { id } = ctx.session.listClearing.list.shift();

  if (ctx.match[1] === 'yes') {
    ctx.session.listClearing.listItemsToDeleteIds.push(id);
  }

  if (ctx.match[1] === 'cancel' || ctx.session.listClearing.list.length === 0) {
    if (ctx.session.listClearing.list.length === 0) {
      eventBus.emit(Events.Editing.DeleteItems, ctx.session.listClearing.listItemsToDeleteIds);
    }

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.session.listClearing.promptMessageId,
      undefined,
      ctx.session.listClearing.list.length === 0 ? 'Список очищен' : 'Очистка списка отменена',
    );

    await ctx.telegram.deleteMessage(
      ctx.chat.id,
      ctx.session.listClearing.messageId,
    );

    delete ctx.session.listClearing;

    return;
  }

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.session.listClearing.messageId,
    undefined,
    new Format.FmtString(
      ctx.session.listClearing.list[0].name,
      [{ offset: 0, length: ctx.session.listClearing.list[0].name.length, type: 'bold' }],
    ),
    LIST_CLEARING_MESSAGE_INLINE_KEYBOARD,
  );
};

/** @type {ModuleConfigureFunction} */
const configure = (bot) => {
  const eventBus = inject(InjectionToken.EventBus);

  /**
   * При получении комманды /clear_list, если чат не групповой, бот отправляет сообщение-приглашение
   * и основное сообщение. В основном сообщении последовательно появляются названия элементов
   * списка, отсортированные по вероятности того, что они выби подарены. Названия сменяются при
   * выборе пользователем одной из [опций]{@link LIST_CLEARING_MESSAGE_INLINE_KEYBOARD}
   * на встроенной клавиатуре
   */
  bot.command('clear_list', (ctx) => clearListCommandHandler(eventBus, ctx));

  /**
   * При вызове действий очистки списка бот удаляет первый элемнет в очереди. Если действие
   * соответствует утвердительному ответу на вопрос, подарен ли элемент списка, бот выпускает
   * событие удаления этого элемента списка. Если действие соответствует прерыванию очистки списка
   * или очередь пуста, бот редактирует сообщение-приглашение, информируя пользователя об успешном
   * завершении очистки списка, и удаляет сообщение с названиями элементов списка. Иначе бот
   * редактирует сообщение с названиями элементов списка, подставляя очередное название
   */
  bot.action(/^clear_list_(yes|no|cancel)$/, (ctx) => clearListActionsHandler(eventBus, ctx));
};

export default { configure };
