import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { matchers, replaceEsm, reset, verify, when } from 'testdouble';
import resolveModule from '@tmible/wishlist-bot/helpers/resolve-module';
import Events from '@tmible/wishlist-bot/store/events';

describe('getUseridFromInput', () => {
  let getUseridFromInput;
  let emit;

  const usernames = new Map([
    [ '123', 'username' ],
    [ 'username', '123' ],
  ]);

  beforeEach(async () => {
    ({ emit } = await resolveModule('@tmible/wishlist-bot/store/event-bus')
      .then((path) => replaceEsm(path)));
    getUseridFromInput = await import('../get-userid-from-input.js')
      .then((module) => module.default);
  });

  afterEach(reset);

  it('should return nulls if no userid or username found', () => {
    assert.deepEqual(getUseridFromInput(' random string\t'), [ null, null ]);
  });

  describe('if userid found', () => {
    it('should request username and check userid', () => {
      getUseridFromInput('123');
      verify(emit(Events.Usernames.GetUseridAndUsernameIfPresent, '123'));
    });

    it('should return userid and username', () => {
      when(
        emit(matchers.anything(), matchers.isA(String)),
      ).thenDo(
        (_, useridOrUsername) => [ useridOrUsername, usernames.get(useridOrUsername) ],
      );
      assert.deepEqual(getUseridFromInput('123'), [ '123', 'username' ]);
    });
  });

  describe('if username found', () => {
    it('should request userid', () => {
      getUseridFromInput('username');
      verify(emit(Events.Usernames.GetUseridByUsername, 'username'));
    });

    it('should return userid and username', () => {
      when(
        emit(matchers.anything(), matchers.isA(String)),
      ).thenDo(
        (_, useridOrUsername) => usernames.get(useridOrUsername),
      );
      assert.deepEqual(getUseridFromInput('username'), [ '123', 'username' ]);
    });
  });
});
