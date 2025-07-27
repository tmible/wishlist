import { describe, it } from 'node:test';
import { replaceEsm, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  { emit },
  sendList,
  createGroup,
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/event-bus'),
  replaceEsm('../../wishlist/helpers/send-list.js').then((module) => module.default),
  replaceEsm('../use-cases/create.js').then((module) => module.default),
]);
const botActionHandler = await import('../bot-action-handler.js').then((module) => module.default);

describe('groups / bot action handler', () => {
  it('should create group', async () => {
    await botActionHandler({ match: [ null, '123' ] });
    verify(createGroup(123));
  });

  it('should update list in chat', async () => {
    const ctx = { match: [ null, null, '456' ] };
    await botActionHandler(ctx);
    verify(sendList({ emit }, ctx, 456));
  });
});
