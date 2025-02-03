import { inject, provide } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InjectionToken } from '$lib/architecture/injection-token';
import { initPortalDAUStatement } from '../dau-statement.js';

vi.mock('@tmible/wishlist-common/dependency-injector');

const statement = 'statement';

describe('portal DAU statement', () => {
  let db;

  beforeEach(() => {
    db = { prepare: vi.fn(() => statement) };
    vi.mocked(inject).mockReturnValue(db);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should inject database', () => {
    initPortalDAUStatement();
    expect(vi.mocked(inject)).toHaveBeenCalledWith(InjectionToken.Database);
  });

  it('should prepare statement', () => {
    initPortalDAUStatement();
    expect(db.prepare).toHaveBeenCalledWith(expect.any(String));
  });

  it('should provide statement', () => {
    initPortalDAUStatement();
    expect(vi.mocked(provide)).toHaveBeenCalledWith(InjectionToken.PortalDAUStatement, statement);
  });
});
