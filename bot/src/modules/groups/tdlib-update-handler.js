import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import Events from '@tmible/wishlist-bot/architecture/events';
import { Client } from './injection-tokens.js';

/** @typedef {import('tdl').Update} Update */

/**
 * Статус назначаемого при выходе из группы администратора
 * @constant {Record<string, unknown>}
 */
const ADMINISTRATOR_STATUS = {
  '@type': 'chatMemberStatusAdministrator',
  custom_title: '',
  can_be_edited: true,
  rights: {
    can_manage_chat: true,
    can_change_info: true,
    can_post_messages: true,
    can_edit_messages: true,
    can_delete_messages: true,
    can_invite_users: true,
    can_restrict_members: true,
    can_pin_messages: true,
    can_manage_topics: true,
    can_promote_members: true,
    can_manage_video_chats: true,
    can_post_stories: true,
    can_edit_stories: true,
    can_delete_stories: true,
    is_anonymous: false,
  },
};

/**
 * Построение цепи обработчиков обновления клиента Телеграм
 * Если очередной обработчик в цепи вернёт false, выполенение цепи прервётся
 * Каждый обрабочик получает единственным аргументом контекст, куда может записывать данные
 * и откуда может получать от предыдущих обработчиков
 * @function chainUpdateHandlers
 * @param {((context: Record<string, unknown>) => boolean)[]} handlers обработчики
 * @returns {Promise<(update: Update) => Promise<void>>} Функция-обёртка, запускающая цепь
 * @async
 */
const chainUpdateHandlers = (...handlers) => async (update) => {
  const context = { update };
  for (const handler of handlers) {
    if (!(await handler(context))) {
      break;
    }
  }
};

/**
 * Проверка что в обновлении получено новое сообщение-ответ
 * @function checkUpdate
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const checkUpdate = ({ update }) => update._ === 'updateNewMessage' && update.message.reply_to;

/**
 * Получение клиента Телеграм
 * @function getClient
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const getClient = (context) => {
  context.client = inject(Client);
  return true;
};

/**
 * Проверка что сообщение, в ответ на которое
 * только что получено сообщение, отпрвлено от имени группы
 * @function checkMessage
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const checkMessage = async (context) => {
  const { client, update } = context;
  const message = await client.invoke({
    _: 'getMessage',
    chat_id: update.message.reply_to.chat_id,
    message_id: update.message.reply_to.message_id,
  });
  if (message.sender_id.chat_id !== message.chat_id) {
    return false;
  }
  context.message = message;
  return true;
};

/**
 * Проверка что чат является супергруппой
 * @function checkChat
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const checkChat = async (context) => {
  const { client, message } = context;
  const chat = await client.invoke({ _: 'getChat', chat_id: message.chat_id });
  context.supergroup_id = chat.type.supergroup_id;
  return !!chat.type.supergroup_id;
};

/**
 * Проверка что групппа создана авторизованным аккаунтом
 * @function checkMember
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const checkMember = async ({ client, message }) => {
  const member = await client.invoke({
    _: 'getChatMember',
    chat_id: message.chat_id,
    member_id: { '@type': 'messageSenderUser', user_id: process.env.SUPPORT_ACCOUNT_USERID },
  });
  return member.status._ === 'chatMemberStatusCreator';
};

const checkOwnershipTransfer = async (context) => {
  const canTransferOwnershipResult = await context.client.invoke({ _: 'canTransferOwnership' });
  context.canTransferOwnership = canTransferOwnershipResult._ === 'canTransferOwnershipResultOk';
  return true;
};

/**
 * Передача ответившему на сообщение прав на группу или назначение
 * его администратором и выход из группы
 * @function transferGroupAndLeave
 * @param {Record<string, unknown>} context Контекст цепи обработчиков
 * @returns {boolean} Признак необходимости продолжения работы цепи
 */
const transferGroupAndLeave = async (
  { client, update, message, canTransferOwnership, supergroup_id },
) => {
  if (canTransferOwnership) {

    const { invite_link: { invite_link } } = await client.invoke({
      _: 'getSupergroupFullInfo',
      supergroup_id,
    });
    await client.invoke({
      _: 'transferChatOwnership',
      chat_id: message.chat_id,
      user_id: update.message.sender_id.user_id,
      password: process.env.SUPPORT_ACCOUNT_2FA_PASSWORD,
    });
    emit(Events.Wishlist.DeleteWishlistItemGroupLink, invite_link);

  } else {

    await client.invoke({
      _: 'setChatMemberStatus',
      chat_id: message.chat_id,
      member_id: update.message.sender_id,
      status: ADMINISTRATOR_STATUS,
    });

  }

  await client.invoke({
    _: 'sendMessage',
    chat_id: message.chat_id,
    input_message_content: {
      _: 'inputMessageText',
      text: { _: 'formattedText', text: 'Успешно! Всего хорошего!' },
    },
  });
  await client.invoke({ _: 'leaveChat', chat_id: message.chat_id });
  return true;
};

/**
 * Обработчик обновлений от TDLib. Проверяет, что получено новое сообщение, в ответ на сообщение,
 * оставленное вспомогательным аккаунтом при создании группы от имени группы. Если все проверки
 * проходят, вспомогательный аккаунт, либо передаёт владение группой ответившиму, либо назначает
 * его администратором и в обоих случаях выходит из группы
 */
const tdlibUpdateHandler = chainUpdateHandlers(
  checkUpdate,
  getClient,
  checkMessage,
  checkChat,
  checkMember,
  checkOwnershipTransfer,
  transferGroupAndLeave,
);

export default tdlibUpdateHandler;
