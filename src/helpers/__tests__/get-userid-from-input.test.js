import { strict as assert } from 'node:assert';
import { afterEach, describe, it } from 'node:test';
import { matchers, reset, verify, when } from 'testdouble';
import replaceModule from '@tmible/wishlist-bot/helpers/tests/replace-module';
import Events from '@tmible/wishlist-bot/store/events';

const usernames = new Map([
  [ '123', 'username' ],
  [ 'username', '123' ],
]);

const { emit } = await replaceModule('@tmible/wishlist-bot/store/event-bus');
const getUseridFromInput = await import('../get-userid-from-input.js')
  .then((module) => module.default);

describe('getUseridFromInput', () => {
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
