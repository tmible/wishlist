import { afterEach, beforeEach, describe, it } from 'node:test';
import { func, matchers, reset, verify, when } from 'testdouble';
import Events from '@tmible/wishlist-bot/architecture/events';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import { Client } from '../../injection-tokens.js';

const WISHLIST_ITEM_ID = 123;

const client = { invoke: func() };
const status = { property: 'value', custom_title: '', is_anonymous: false };

const [
  { inject },
  { emit },
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/dependency-injector'),
  replaceModule('@tmible/wishlist-common/event-bus'),
]);
const createGroup = await import('../create.js').then((module) => module.default);

describe('groups / use cases / create', () => {
  beforeEach(() => {
    process.env.SUPPORT_ACCOUNT_USERID = 'SUPPORT_ACCOUNT_USERID';
    when(emit(), { ignoreExtraArgs: true }).thenReturn('title');
    when(inject(), { ignoreExtraArgs: true }).thenReturn(client);
    when(
      client.invoke(),
      { ignoreExtraArgs: true },
    ).thenResolve(
      { id: 'chat id', type: { supergroup_id: 'supergroup id' } },
      { invite_link: { invite_link: 'invite link' } },
      { status },
    );
  });

  afterEach(reset);

  it('should get wishliust item name ', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(emit(Events.Wishlist.GetWishlistItemName, WISHLIST_ITEM_ID));
  });

  it('should inject Telegram client', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(inject(Client));
  });

  it('should create new supergroup', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(client.invoke({ _: 'createNewSupergroupChat', title: 'title' }));
  });

  it('should get invite link', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(client.invoke({
      _: 'getSupergroupFullInfo',
      supergroup_id: 'supergroup id',
    }));
  });

  it('should set chat member status', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(
      client.invoke({
        _: 'setChatMemberStatus',
        chat_id: 'chat id',
        member_id: { '@type': 'messageSenderUser', user_id: 'SUPPORT_ACCOUNT_USERID' },
        status: { property: 'value', custom_title: 'Wishni', is_anonymous: true },
      }),
    );
  });

  it('should send welcome message', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(client.invoke({
      _: 'sendMessage',
      chat_id: 'chat id',
      input_message_content: {
        _: 'inputMessageText',
        text: {
          _: 'formattedText',
          text: matchers.isA(String),
          entities: [{
            _: 'textEntity',
            type: { _: 'textEntityTypeCode' },
            offset: 97,
            length: 9,
          }],
        },
      },
    }));
  });

  it('should save group link', async () => {
    await createGroup(WISHLIST_ITEM_ID);
    verify(emit(Events.Wishlist.SetWishlistItemGroupLink, WISHLIST_ITEM_ID, 'invite link'));
  });
});
