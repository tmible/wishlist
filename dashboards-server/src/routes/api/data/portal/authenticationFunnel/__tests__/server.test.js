import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GetAuthenticationFunnel } from '$lib/server/db/portal/events.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock(
  '$lib/server/db/portal/events.js',
  () => ({ GetAuthenticationFunnel: 'get authentication funnel' }),
);

describe('portal authenticationFunnel endpoint', () => {
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
    await expect(response.text()).resolves.toBe('missing periodStart parameter');
  });

  it('should emit event', () => {
    vi.mocked(emit).mockReturnValueOnce({});
    GET({ url: { searchParams: { get: () => 'param' } } });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetAuthenticationFunnel), 'param');
  });

  it('should return event result', () => {
    const authentications = Math.random();
    const landingVisits = Math.random();
    vi.mocked(emit).mockReturnValueOnce({ authentications, landingVisits });
    expect(
      GET({ url: { searchParams: { get: () => 'param' } } }),
    ).toBe(
      authentications / landingVisits,
    );
  });
});
