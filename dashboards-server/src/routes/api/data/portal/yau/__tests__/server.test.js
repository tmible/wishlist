import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetYAU } from '$lib/server/db/portal/events.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('$lib/server/db/portal/events.js', () => ({ GetYAU: 'get YAU' }));

describe('portal yau endpoint', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue('now');
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
    await expect(response.text()).resolves.toBe('missing periodStart parameter');
  });

  it('should emit event', () => {
    GET({ url: { searchParams: { get: () => 'param' } } });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(vi.mocked(GetYAU), 'param', 'now');
  });

  it('should return event result', () => {
    vi.mocked(emit).mockReturnValueOnce('yau');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toBe('yau');
  });
});
