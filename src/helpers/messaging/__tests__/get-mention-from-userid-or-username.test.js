import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Format } from 'telegraf';
import * as td from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';

describe('getMentionFromUseridOrUsername', () => {
  let getNickname;
  let getMentionFromUseridOrUsername;

  beforeEach(async () => {
    getNickname =
      (await td.replaceEsm(await resolveModule('@tmible/wishlist-bot/utils/get-nickname'))).default;
    getMentionFromUseridOrUsername =
      (await import('../get-mention-from-userid-or-username.js')).default;
  });

  afterEach(() => td.reset());

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
    td.when(getNickname(), { ignoreExtraArgs: true }).thenReturn('nickname');
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
