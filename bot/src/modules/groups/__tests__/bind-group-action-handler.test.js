import { describe, it } from 'node:test';
import { replaceEsm, verify } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const [
  { emit },
  sendList,
  bindGroup,
] = await Promise.all([
  replaceModule('@tmible/wishlist-common/event-bus'),
  replaceEsm('../../wishlist/helpers/send-list.js').then((module) => module.default),
  replaceEsm('../use-cases/bind.js').then((module) => module.default),
]);
const bindGroupActionHandler = await import(
  '../bind-group-action-handler.js',
).then(
  (module) => module.default,
);

describe('groups / bot bind group action handler', () => {
  it('should bind group', async () => {
    const ctx = { match: [ null, '123' ] };
    await bindGroupActionHandler(ctx);
    verify(bindGroup(ctx, 123));
  });

  it('should update list in chat', async () => {
    const ctx = { match: [ null, null, '456' ] };
    await bindGroupActionHandler(ctx);
    verify(sendList({ emit }, ctx, 456));
  });
});
