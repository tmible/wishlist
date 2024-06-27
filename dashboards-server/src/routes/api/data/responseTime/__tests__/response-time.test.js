import { afterEach, describe, expect, it, vi } from 'vitest';
import { responseTimeStatement } from '$lib/server/response-time-statement.const.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock(
  '$lib/server/response-time-statement.const.js',
  () => ({ responseTimeStatement: { all: vi.fn() } }),
);

describe('responseTime endpoint', () => {
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
    expect(responseTimeStatement.all).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    responseTimeStatement.all.mockReturnValue('responseTime');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toEqual('responseTime');
  });
});
