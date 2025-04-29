import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTHORIZATION_ERROR_MESSAGE,
} from '$lib/server/constants/authorization-error-message.const.js';
import { Database } from '../injection-tokens.js';
import { runStatementAuthorized } from '../run-statement-authorized.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('DB / run statement authorized', () => {
  let db;
  let transaction;

  beforeEach(() => {
    db = {
      transaction: vi.fn(
        (passedFunction) => {
          transaction = passedFunction;
          return () => {};
        },
      ),
    };
    vi.mocked(inject).mockReturnValueOnce(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shoud inject DB', () => {
    runStatementAuthorized();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('shoud run transaction', () => {
    runStatementAuthorized();
    expect(db.transaction).toHaveBeenCalledWith(expect.any(Function));
  });

  describe('transaction', () => {
    it('shoud run statement', () => {
      const runStatement = vi.fn(() => ({ changes: 1 }));
      runStatementAuthorized(runStatement, 1);
      transaction();
      expect(runStatement).toHaveBeenCalled();
    });

    it('shoud throw error if there are no as many entities as required', () => {
      runStatementAuthorized(() => ({ chages: 0 }), 1);
      expect(transaction).toThrowError(AUTHORIZATION_ERROR_MESSAGE);
    });
  });
});
