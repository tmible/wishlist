import { strict as assert } from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { Format } from 'telegraf';
import { reset, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';

const getNickname = await replaceModule('@tmible/wishlist-bot/utils/get-nickname');
const getMentionFromUseridOrUsername = await import('../get-mention-from-userid-or-username.js')
  .then((module) => module.default);

describe('getMentionFromUseridOrUsername', () => {
  afterEach(reset);

  it('should return mention for username', () => {
    assert.deepEqual(
      getMentionFromUseridOrUsername(null, 'username'),
      new Format.FmtString(
        '@username',
        [{
          type: 'mention',
          offset: 0,
          length: 9,
        }],
      ),
    );
  });

  it('should return mention for userid', () => {
    const userid = 'userid';
    const nickname = 'nickname';
    when(getNickname(), { ignoreExtraArgs: true }).thenReturn('nickname');
    assert.deepEqual(
      getMentionFromUseridOrUsername(userid, null),
      new Format.FmtString(
        nickname,
        [{
          type: 'text_link',
          offset: 0,
          length: nickname.length,
          url: `tg://user?id=${userid}`,
        }, {
          type: 'underline',
          offset: 0,
          length: nickname.length,
        }],
      ),
    );
  });
});
