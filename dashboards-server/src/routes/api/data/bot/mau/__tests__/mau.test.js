import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GetMAU } from '$lib/server/db/bot/events.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/event-bus');

describe('bot mau endpoint', () => {
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
    expect(
      vi.mocked(emit),
    ).toHaveBeenCalledWith(
      GetMAU,
      { periodStart: 'param', periodEnd: 'now' },
    );
  });

  it('should return event result', () => {
    vi.mocked(emit).mockReturnValueOnce('mau');
    expect(GET({ url: { searchParams: { get: () => 'param' } } })).toBe('mau');
  });
});
