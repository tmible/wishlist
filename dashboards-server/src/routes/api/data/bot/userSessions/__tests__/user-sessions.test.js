import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GetUserSessions } from '$lib/server/db/bot/events.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('@tmible/wishlist-common/event-bus');

describe('bot userSessions endpoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit event', () => {
    GET();
    expect(vi.mocked(emit)).toHaveBeenCalledWith(GetUserSessions);
  });

  it('should return event result', () => {
    vi.mocked(emit).mockReturnValueOnce([{ name: '1' }, { name: '2' }]);
    expect(GET()).toEqual([{ name: '1' }, { name: '2' }]);
  });
});
