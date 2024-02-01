import { strict as assert } from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import * as td from 'testdouble';
import resolveModule from 'wishlist-bot/helpers/resolve-module';
import Events from 'wishlist-bot/store/events';

describe('getUseridFromInput', () => {
  let getUseridFromInput;
  let emit;

  const usernames = new Map([
    [ '123', 'username' ],
    [ 'username', '123' ],
  ]);

  beforeEach(async () => {
    ({ emit } = await td.replaceEsm(await resolveModule('wishlist-bot/store/event-bus')));
    getUseridFromInput = (await import('../get-userid-from-input.js')).default;
  });

  afterEach(() => td.reset());

  it('should return nulls if no userid or username found', () => {
    assert.deepEqual(getUseridFromInput(' random string\t'), [ null, null ]);
  });

  describe('if userid found', () => {
    it('should request username', () => {
      getUseridFromInput('123');
      td.verify(emit(Events.Usernames.GetUsernameByUserid, '123'));
    });

    it('should return userid and username', () => {
      td.when(
        emit(td.matchers.anything(), td.matchers.isA(String)),
      ).thenDo(
        (_, useridOrUsername) => usernames.get(useridOrUsername),
      );
      assert.deepEqual(getUseridFromInput('123'), [ '123', 'username' ]);
    });
  });

  describe('if username found', () => {
    it('should request userid', () => {
      getUseridFromInput('username');
      td.verify(emit(Events.Usernames.GetUseridByUsername, 'username'));
    });

    it('should return userid and username', () => {
      td.when(
        emit(td.matchers.anything(), td.matchers.isA(String)),
      ).thenDo(
        (_, useridOrUsername) => usernames.get(useridOrUsername),
      );
      assert.deepEqual(getUseridFromInput('username'), [ '123', 'username' ]);
    });
  });
});
