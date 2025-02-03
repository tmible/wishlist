import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initAddActionStatement } from '../add-action-statement.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const statement = 'statement';

describe('add action statement', () => {
  let db;

  beforeEach(() => {
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initAddActionStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.LogsDatabase);
  });

  it('should prepare statement', () => {
    initAddActionStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should provide statement', () => {
    initAddActionStatement();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.AddActionStatement, statement);
  });
});
