import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import Events from '@tmible/wishlist-bot/architecture/events';
import getUseridFromInput from '../get-userid-from-input.js';

const usernames = new Map([
  [ '123', 'username' ],
  [ 'username', '123' ],
]);

describe('getUseridFromInput', () => {
  it('should return nulls if no userid or username found', () => {
    assert.deepEqual(getUseridFromInput({}, ' random string\t'), [ null, null ]);
  });

  describe('if userid found', () => {
    let emit;

    beforeEach(() => {
      emit = mock.fn(
        (_, useridOrUsername) => [ useridOrUsername, usernames.get(useridOrUsername) ],
      );
    });

    afterEach(() => mock.reset());

    it('should request username and check userid', () => {
      getUseridFromInput({ emit }, '123');
      assert.deepEqual(
        emit.mock.calls[0].arguments,
        [ Events.Usernames.GetUseridAndUsernameIfPresent, '123' ],
      );
    });

    it('should return userid and username', () => {
      assert.deepEqual(getUseridFromInput({ emit }, '123'), [ '123', 'username' ]);
    });
  });

  describe('if username found', () => {
    let emit;

    beforeEach(() => {
      emit = mock.fn((_, useridOrUsername) => usernames.get(useridOrUsername));
    });

    afterEach(() => mock.reset());

    it('should request userid', () => {
      getUseridFromInput({ emit }, 'username');
      assert.deepEqual(
        emit.mock.calls[0].arguments,
        [ Events.Usernames.GetUseridByUsername, 'username' ],
      );
    });

    it('should return userid and username', () => {
      assert.deepEqual(getUseridFromInput({ emit }, 'username'), [ '123', 'username' ]);
    });
  });
});
