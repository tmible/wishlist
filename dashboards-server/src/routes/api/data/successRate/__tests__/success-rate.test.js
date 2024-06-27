import { afterEach, describe, expect, it, vi } from 'vitest';
import { successRateStatement } from '$lib/server/success-rate-statement.const.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock(
  '$lib/server/success-rate-statement.const.js',
  () => ({ successRateStatement: { get: vi.fn() } }),
);

describe('successRate endpoint', () => {
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
    successRateStatement.get.mockReturnValue({});
    GET({ url: { searchParams: { get: () => 'param' } } });
    expect(successRateStatement.get).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    const successful = Math.random();
    const total = Math.random();
    successRateStatement.get.mockReturnValue({ successful, total });
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toEqual(successful / total);
  });
});
