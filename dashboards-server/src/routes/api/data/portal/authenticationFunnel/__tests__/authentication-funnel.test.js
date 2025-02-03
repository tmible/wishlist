import { inject } from '@tmible/wishlist-common/dependency-injector';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/dependency-injector');

describe('portal authenticationFunnel endpoint', () => {
  let authenticationFunnelStatement;

  beforeAll(() => {
    authenticationFunnelStatement = { get: vi.fn() };
    vi.mocked(inject).mockReturnValue(authenticationFunnelStatement);
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
    authenticationFunnelStatement.get.mockReturnValue({});
    GET({ url: { searchParams: { get: () => 'param' } } });
    expect(authenticationFunnelStatement.get).toHaveBeenCalled();
  });

  it('should return SQL statement run result', () => {
    const authentications = Math.random();
    const landingVisits = Math.random();
    authenticationFunnelStatement.get.mockReturnValue({ authentications, landingVisits });
    expect(
      GET({ url: { searchParams: { get: () => 'param' } } }),
    ).toEqual(
      authentications / landingVisits,
    );
  });
});
