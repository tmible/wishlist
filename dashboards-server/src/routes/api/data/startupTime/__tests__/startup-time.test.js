import { afterEach, describe, expect, it, vi } from 'vitest';
import { startupTimeStatement } from '$lib/server/startup-time-statement.const.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock(
  '$lib/server/startup-time-statement.const.js',
  () => ({ startupTimeStatement: { all: vi.fn() } }),
);

describe('startupTime endpoint', () => {
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
    expect(startupTimeStatement.all).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    startupTimeStatement.all.mockReturnValue('startupTime');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toEqual('startupTime');
  });
});
