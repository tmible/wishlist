import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import { Client } from '../injection-tokens.js';

const client = { invoke: func() };
const update = {
  _: 'updateNewMessage',
  message: {
    reply_to: { chat_id: 'chat id', message_id: 'message id' },
    sender_id: { user_id: 'sender id' },
  },
};

const [{ inject }, { emit }] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceModule('@tmible/wishlist-common/event-bus'),
]);
const tdlibUpdateHandler = await import(
  '../tdlib-update-handler.js',
).then(
  (module) => module.default,
);

describe('groups / TDLib update handler', () => {
  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_USERID = 'SUPPORT_ACCOUNT_USERID';
    when(inject(Client)).thenReturn(client);
  });

  afterEach(reset);

  describe('if can transfer ownership', () => {
    beforeEach(() => {
      process.env.SUPPORT_ACCOUNT_2FA_PASSWORD = 'SUPPORT_ACCOUNT_2FA_PASSWORD';
      when(
        client.invoke(),
        { ignoreExtraArgs: true },
      ).thenResolve(
        { chat_id: 'chat id', sender_id: { chat_id: 'chat id' } },
        { type: { supergroup_id: 'supergroup id' } },
        { status: { _: 'chatMemberStatusCreator' } },
        { _: 'canTransferOwnershipResultOk' },
        { invite_link: { invite_link: 'invite link' } },
      );
    });

    it('should transfer ownership', async () => {
      await tdlibUpdateHandler(update);
      verify(
        client.invoke({
          _: 'transferChatOwnership',
          chat_id: 'chat id',
          user_id: 'sender id',
          password: 'SUPPORT_ACCOUNT_2FA_PASSWORD',
        }),
      );
    });

    it('should delete group link', async () => {
      await tdlibUpdateHandler(update);
      verify(emit(Events.Wishlist.DeleteWishlistItemGroupLink, 'invite link'));
    });

    it('should send good bye message', async () => {
      await tdlibUpdateHandler(update);
      verify(
        client.invoke({
          _: 'sendMessage',
          chat_id: 'chat id',
          input_message_content: {
            _: 'inputMessageText',
            text: { _: 'formattedText', text: 'Успешно! Всего хорошего!' },
          },
        }),
      );
    });

    it('should leave chat', async () => {
      await tdlibUpdateHandler(update);
      verify(client.invoke({ _: 'leaveChat', chat_id: 'chat id' }));
    });
  });

  describe('if cannot transfer ownership', () => {
    beforeEach(() => {
      when(
        client.invoke(),
        { ignoreExtraArgs: true },
      ).thenResolve(
        { chat_id: 'chat id', sender_id: { chat_id: 'chat id' } },
        { type: { supergroup_id: 'supergroup id' } },
        { status: { _: 'chatMemberStatusCreator' } },
        { _: 'canTransferOwnershipResultFail' },
      );
    });

    it('should set admin', async () => {
      await tdlibUpdateHandler(update);
      verify(
        client.invoke({
          _: 'setChatMemberStatus',
          chat_id: 'chat id',
          member_id: { user_id: 'sender id' },
          status: {
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
          },
        }),
      );
    });

    it('should send good bye message', async () => {
      await tdlibUpdateHandler(update);
      verify(
        client.invoke({
          _: 'sendMessage',
          chat_id: 'chat id',
          input_message_content: {
            _: 'inputMessageText',
            text: { _: 'formattedText', text: 'Успешно! Всего хорошего!' },
          },
        }),
      );
    });

    it('should leave chat', async () => {
      await tdlibUpdateHandler(update);
      verify(client.invoke({ _: 'leaveChat', chat_id: 'chat id' }));
    });
  });
});
