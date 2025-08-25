import { inject } from '@tmible/wishlist-common/dependency-injector';
import { emit } from '@tmible/wishlist-common/event-bus';
import Events from '@tmible/wishlist-bot/architecture/events';
import { Client } from '../injection-tokens.js';

/**
 * Текст приветственного сообщения в группе
 * @constant {string}
 */
const WELCOME_MESSAGE_TEXT = '\
Добро пожаловать! Если вам нужны права админа, ответьте на это \
сообщение. Например, написав мне «Пока-пока». После этого я передам вам права и уйду.\n\n\
Учтите, что при передаче прав на группу пригласительная ссылка перестанет работать и я отвяжу \
группу от подарка. Чтобы заново привзять группу к подарку, добавьте бота @wishnibot, запросите \
список и нажмите кнопку «Привязать эту группу»\
';

/**
 * Создание группы для кооперации по подарку и сохранение пригласительной ссылки
 * @function createGroup
 * @param {number} wishlistItemId Идентификатор подарка
 * @returns {Promise<void>}
 * @async
 */
const createGroup = async (wishlistItemId) => {
  const title = emit(Events.Wishlist.GetWishlistItemName, wishlistItemId);
  const client = inject(Client);
  const { id: chat_id, type: { supergroup_id } } = await client.invoke(
    { _: 'createNewSupergroupChat', title },
  );
  const { invite_link: { invite_link } } = await client.invoke({
    _: 'getSupergroupFullInfo',
    supergroup_id,
  });
  const member_id = { '@type': 'messageSenderUser', user_id: process.env.SUPPORT_ACCOUNT_USERID };
  const { status } = await client.invoke({ _: 'getChatMember', chat_id, member_id });
  await client.invoke({
    _: 'setChatMemberStatus',
    chat_id,
    member_id,
    status: { ...status, custom_title: 'Wishni', is_anonymous: true },
  });
  await client.invoke({
    _: 'sendMessage',
    chat_id,
    input_message_content: {
      _: 'inputMessageText',
      text: {
        _: 'formattedText',
        text: WELCOME_MESSAGE_TEXT,
        entities: [{
          _: 'textEntity',
          type: { _: 'textEntityTypeCode' },
          offset: 97,
          length: 9,
        }, {
          _: 'textEntity',
          type: { _: 'textEntityTypeMention' },
          offset: 317,
          length: 10,
        }],
      },
    },
  });
  emit(Events.Wishlist.SetWishlistItemGroupLink, wishlistItemId, invite_link);
};

export default createGroup;
