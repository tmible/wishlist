import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { nwAlign } from 'seal-wasm';
import { Markup } from 'telegraf';
import InjectionToken from '@tmible/wishlist-bot/architecture/injection-token';
import tryPinning from '@tmible/wishlist-bot/helpers/messaging/try-pinning';
import { sendMessageAndMarkItForMarkupRemove } from '@tmible/wishlist-bot/helpers/middlewares/remove-markup';
import formTitleMessageMarkup from './form-title-message-markup.js';

/** @typedef {import('telegraf').Context} Context */
/** @typedef {import('telegraf').Format} Format */
/** @typedef {import('seal-wasm').Options} Options */
/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/form-foreign-list-messages').Message
 * } Message
 */
/**
 * @typedef {
 *   import('@tmible/wishlist-bot/helpers/messaging/manage-lists-messages').MessageToEdit
 * } MessageToEdit
 */

/**
 * Параметры для [алгоритма Нидлмана-Вунша]{@link nwAlign}: тип алгоритма выравнивания,
 * похожесть равных символов, штраф за различающиеся символы,
 * штраф за пропуск во второй последовательности, штраф за пропуск в первой последовательности
 * @constant {Options}
 */
const NWAlignOptions = { alignment: 'global', equal: 1, align: 0, insert: -2, delete: -3 };

/**
 * Проверка отправляемого сообщения на наличие изменений относительно отправленной ранее версии
 * @function checkIfMessageChanged
 * @param {MessageToEdit} messageToEdit Отправленное ранее сообщение
 * @param {Message} message Отправляемое сообщение
 * @returns {boolean} Признак наличия изменений в сообщении
 */
const checkIfMessageChanged = (messageToEdit, message) => {
  /**
   * Проверка на равенство всех элементов разметки текста, кроме ссылок, так как они определяются
   * автоматически и могут отсутствовать в разметке текста отправляемого сообщения.
   * Элемнеты разметки текста в отправленном сообщении предварительно объединяются. На случай,
   * если будут два таких элемента, один из которых заканчивается на том же символе, на котором
   * начинается другой
   */
  const areEntitiesEqual = arrayToOrderedJSON(
    messageToEdit.entities
      .filter(({ type }) => type !== 'url')
      .reduce(
        (accum, current) => {
          const successor = messageToEdit.entities.find(
            ({ offset, type }) => (
              type === current.type &&
              offset === current.offset + current.length
            ),
          );
          if (successor) {
            accum.push({ ...current, length: current.length + successor.length });
          }
          const predecessor = messageToEdit.entities.find(
            ({ offset, length, type }) => (
              type === current.type &&
              offset + length === current.offset
            ),
          );
          if (!successor && !predecessor) {
            accum.push(current);
          }
          return accum;
        },
        [],
      ),
  ) === arrayToOrderedJSON(
    message[0].entities.filter(({ type }) => type !== 'url'),
  );

  /**
   * Проверка на равенство встроенной клавиатуры, в частности текстов
   * и названий действий кнопок, так как остальные свойства не используются,
   * получают значения по умолчанию и опускаются Телеграмом
   */
  const areReplyMarkupsEqual = arrayToOrderedJSON(
    messageToEdit.reply_markup?.inline_keyboard.map(
      (row) => row.map(({ text, callback_data }) => ({ text, callback_data })),
    ) ?? [],
  ) === arrayToOrderedJSON(
    message[1]?.reply_markup.inline_keyboard.map(
      (row) => row.map(({ text, callback_data }) => ({ text, callback_data })),
    ) ?? [],
  );

  return !areEntitiesEqual || !areReplyMarkupsEqual || messageToEdit.text !== message[0].text;
};

/**
 * Построение выравнивания последовательностей идентификаторов подарков в отправленных ранее
 * сообщениях и в отправляемых с помощью алгоритма [Нидлмана-Вунша]{@link nwAlign}
 * с такими [параметрами]{@link NWAlignOptions}, чтобы в первой последовательности не было
 * пропусков, так как в отправленные ранее сообщения невозможно вклинить новые.
 * Оба массива сообщений приводятся к строкам, где каждому идентификатору подарка
 * ставится в соответствие уникальный символ
 * @function alignItemsIds
 * @param {object[]} messagesToEdit Отправленные ранее сообщения
 * @param {Message[]} messages Отправляемые сообщения
 * @returns {string} Строка выравнивания. Содержит символы `=`, `!`, `-`.
 * `=` обозначает равенство идентификаторов, `!` -- различие,
 * `-` -- пропуск очередного идентификатора из уже отправленных сообщений.
 * Возможен ещё `+`, обозначающий пропуск очередного идентификатора из отправляемых сообщений,
 * но в этом контексте его появление -- баг
 * @async
 */
const alignItemsIds = async (messagesToEdit, messages) => {
  const itemsIdsMap = new Map(messagesToEdit.map(({ itemId }, i) => [ itemId, i ]));

  for (const { itemId } of messages) {
    if (itemsIdsMap.has(itemId)) {
      continue;
    }
    itemsIdsMap.set(itemId, itemsIdsMap.size);
  }

  const { representation } = await nwAlign(
    messagesToEdit.map(({ itemId }) => String.fromCharCode(itemsIdsMap.get(itemId))).join(''),
    messages.map(({ itemId }) => String.fromCharCode(itemsIdsMap.get(itemId))).join(''),
    NWAlignOptions,
  );

  return representation;
};


/**
 * Проверка сообщения на наличие имзенений после отправки телеграму запроса на редатирование
 * Несмотря на все проверки сообщение всё ещё может быть без изменений
 * @function handleEditingError
 * @param {Error} e Полученная ошибка
 * @param {Record<string, unknown>} messageToEdit Редактируемое сообщение
 * @param {Record<string, unknown>[]} message Обновлённое сообщение
 */
const handleEditingError = (e, messageToEdit, message) => {
  if (!e.message.startsWith('400: Bad Request: message is not modified')) {
    throw e;
  }
  const logger = inject(InjectionToken.Logger);
  logger.error(e.message);
  logger.error(`message to edit text: ${messageToEdit.text}`);
  logger.error(`message to edit entities: ${messageToEdit.entities}`);
  logger.error(`message text: ${message[0].text}`);
  logger.error(`message entities: ${message[0].entities}`);
};

/**
 * 1. Построение выравнивания последовательностей идентификаторов в отправленных ранее сообщениях
 * и отправляемых сообщениях. Если количество сообщений одинаковое, строка выравнивания
 * (см. возвращаемое значение {@link alignItemsIds}) конструируется на месте, если различное,
 * [используется алгоритм Нидлмана-Вушна]{@link alignItemsIds}.
 * 2. На основании выравнивания редактирование или удаление сообщений с обновалением онформации
 * в персистентной сессии.
 * @function editMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @async
 */
const editMessages = async (ctx, userid, messages) => {
  const { messagesToEdit } = ctx.session.persistent.lists[userid];

  const alignmentRepresentation = messages.length === 0 ?
    messagesToEdit.map(() => '-').join('') :
    (
      messagesToEdit.length === messages.length ?
        messagesToEdit.map(
          ({ itemId }, i) => (itemId === messages[i].itemId ? '=' : '!'),
        ).join('') :
        await alignItemsIds(messagesToEdit, messages)
    );

  const sessionPatch = [];
  let messagesIndex = 0;

  await Promise.all(
    alignmentRepresentation.split('').reduce((promises, char, i) => {
      const messageToEdit = messagesToEdit[i];

      if (char === '-') {
        promises.push(ctx.deleteMessage(messageToEdit.id));
      } else if (char === '!' || char === '=') {
        const { itemId, message } = messages[messagesIndex];
        messagesIndex += 1;

        sessionPatch.push({
          ...messageToEdit,
          itemId,
          text: message[0].text,
          entities: message[0].entities,
          reply_markup: message[1]?.reply_markup,
        });

        if (char === '!' || (char === '=' && checkIfMessageChanged(messageToEdit, message))) {
          promises.push(ctx.telegram.editMessageText(
            ctx.chat.id,
            messageToEdit.id,
            undefined,
            ...message,
          ).catch((e) => handleEditingError(e, messageToEdit, message)));
        }
      }

      return promises;
    }, []),
  );

  /* eslint-disable-next-line require-atomic-updates --
    Даже после редактирования сообщений персистентная сессия определена в контексте
  */
  ctx.session.persistent.lists[userid].messagesToEdit = sessionPatch;
};

/**
 * Обновление списка. Перезакрепление заглавного сообщения,
 * [обновление отправленных ранее сообщений]{@link editMessages},
 * если необходимо, отправка сообщения-уведомления об обновлении.
 * @function updateListsMessages
 * @param {Context} ctx Контекст
 * @param {number} userid Идентификатор пользователя -- владельца списка
 * @param {Message[]} messages Новые сообщения со списком
 * @param {Format.FmtString | string} titleMessageText Текст заглавного сообщения актуального списка
 * @param {boolean} shouldSendNotification Признак необходимости отправки
 *   сообщения-уведомления об обновлении
 * @async
 */
const updateListsMessages = async (
  ctx,
  userid,
  messages,
  titleMessageText,
  shouldSendNotification,
) => {
  await tryPinning(ctx, true, ctx.session.persistent.lists[userid].pinnedMessageId);

  if (messages.length === 0) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.session.persistent.lists[userid].pinnedMessageId,
      undefined,
      titleMessageText,
      formTitleMessageMarkup(ctx, userid),
    );
  }

  await editMessages(ctx, userid, messages);

  if (shouldSendNotification) {
    await sendMessageAndMarkItForMarkupRemove(
      ctx,
      'reply',
      'Список обновлён',
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback(
            'Отправить новые сообщения',
            userid === ctx.chat.id ? 'force_own_list' : `force_list ${userid}`,
          ),
        ]),
        reply_to_message_id: ctx.session.persistent.lists[userid].pinnedMessageId,
      },
    );
  }
};

export default updateListsMessages;
