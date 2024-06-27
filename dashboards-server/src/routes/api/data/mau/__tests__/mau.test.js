import { afterEach, describe, expect, it, vi } from 'vitest';
import { mauStatement } from '$lib/server/mau-statement.const.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('$lib/server/mau-statement.const.js', () => ({ mauStatement: { all: vi.fn() } }));

describe('mau endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should return 400 if there is no periodStart', async () => {
    const response = GET({
      url: {
        searchParams: {
          get: (paramName) => (paramName === 'periodStart' ? undefined : 'param'),
        },
      },
    });
    expect(response.status).toEqual(400);
    expect(await response.text()).toEqual('missing periodStart parameter');
  });

  it('should run SQL statement', () => {
    GET({ url: { searchParams: { get: () => 'param' } } });
    expect(mauStatement.all).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    mauStatement.all.mockReturnValue('mau');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toEqual('mau');
  });
});
