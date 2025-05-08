import { resolve } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import assertSnapshot from 'snapshot-assertion';
import { reset, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import formTitleMessageMarkup from '../form-title-message-markup.js';

const { emit } = await replaceModule('@tmible/wishlist-common/event-bus');

describe('formTitleMessageMarkup', () => {
  afterEach(reset);

  it('should form markup for own list', async () => {
    await assertSnapshot(
      JSON.stringify(await formTitleMessageMarkup({ chat: { id: 'userid' } }, 'userid')),
      resolve(
        import.meta.dirname,
        './__snapshots__/form-title-message-markup/should form markup for own list.json',
      ),
    );
  });

  it('should form markup for foreign list', async () => {
    when(emit(), { ignoreExtraArgs: true }).thenReturn(Promise.resolve('hash'));
    await assertSnapshot(
      JSON.stringify(await formTitleMessageMarkup({ chat: { id: 'chatId' } }, 'userid')),
      resolve(
        import.meta.dirname,
        './__snapshots__/form-title-message-markup/should form markup for foreign list.json',
      ),
    );
  });
});
