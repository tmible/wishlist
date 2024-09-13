import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/dependency-injector');

describe('userSessions endpoint', () => {
  let userSessionsStatement;

  beforeAll(() => {
    userSessionsStatement = { all: vi.fn().mockReturnValue([{ name: '1' }, { name: '2' }]) };
    vi.mocked(inject).mockReturnValue(userSessionsStatement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return SQL statement run result', () => {
    expect(
      GET({ url: { searchParams: { get: () => 'param' } } }),
    ).toEqual(
      [{ name: '1' }, { name: '2' }],
    );
  });
});
