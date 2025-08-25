import { strict as assert } from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import { func, replaceEsm, verify } from 'testdouble';
import MessagePurposeType from '@tmible/wishlist-bot/constants/message-purpose-type';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  { emit },
  sendList,
  updateInviteLink,
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/event-bus'),
  replaceEsm('../../wishlist/helpers/send-list.js').then((module) => module.default),
  replaceEsm('../use-cases/update-invite-link.js').then((module) => module.default),
]);
const bindGroupMessageHandler = await import(
  '../bind-group-message-handler.js',
).then(
  (module) => module.default,
);

describe('groups / bot bind group message handler', () => {
  it('should pass if not awaited', async () => {
    const next = func();
    await bindGroupMessageHandler({ session: {} }, next);
    verify(next());
  });

  describe('if awaited', () => {
    let ctx;

    beforeEach(() => {
      ctx = {
        session: {
          messagePurpose: {
            type: MessagePurposeType.InviteLink,
            payload: { wishlistItemId: '123', userid: 'userid' },
          },
        },
        message: { text: 'message' },
        reply: func(),
      };
    });

    it('should update invite link', async () => {
      await bindGroupMessageHandler(ctx);
      verify(updateInviteLink(123, 'message'));
    });

    it('should reply', async () => {
      await bindGroupMessageHandler(ctx);
      verify(ctx.reply('Группа привязана со ссылкой message!'));
    });

    it('should update list in chat', async () => {
      await bindGroupMessageHandler(ctx);
      verify(sendList({ emit }, ctx, 'userid'));
    });

    it('should rermove messagePurpose', async () => {
      await bindGroupMessageHandler(ctx);
      assert.ok(!Object.hasOwn(ctx.session, 'messagePurpose'));
    });
  });
});
