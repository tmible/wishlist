import { afterEach, describe, expect, it, vi } from 'vitest';
import { processTimeStatement } from '$lib/server/process-time-statement.const.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock(
  '$lib/server/process-time-statement.const.js',
  () => ({ processTimeStatement: { all: vi.fn() } }),
);

describe('processTime endpoint', () => {
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
    expect(processTimeStatement.all).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    processTimeStatement.all.mockReturnValue('processTime');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toEqual('processTime');
  });
});
