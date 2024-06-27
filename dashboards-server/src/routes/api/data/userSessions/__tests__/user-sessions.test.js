import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock(
  '$lib/server/user-sessions-statement.const.js',
  () => ({
    userSessionsStatement: {
      all: () => [{
        name: '1',
      }, {
        name: '2',
      }],
    },
  }),
);

describe('userSessions endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should return SQL statement run result', () => {
    expect(
      GET({ url: { searchParams: { get: () => 'param' } } }),
    ).toEqual(
      [{ name: '1' }, { name: '2' }],
    );
  });
});
