import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/dependency-injector');

describe('bot startupTime endpoint', () => {
  let startupTimeStatement;

  beforeAll(() => {
    startupTimeStatement = { all: vi.fn() };
    vi.mocked(inject).mockReturnValue(startupTimeStatement);
  });

  afterEach(() => {
    vi.clearAllMocks();
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
