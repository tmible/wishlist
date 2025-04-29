import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../injection-tokens.js';
import { runTransaction } from '../run-transaction.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

describe('DB / run transaction', () => {
  let db;

  beforeEach(() => {
    db = { transaction: vi.fn().mockReturnValue(() => {}) };
    vi.mocked(inject).mockReturnValueOnce(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shoud inject DB', () => {
    runTransaction();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(Database);
  });

  it('shoud run transaction', () => {
    runTransaction(() => {});
    expect(db.transaction).toHaveBeenCalledWith(expect.any(Function));
  });
});
