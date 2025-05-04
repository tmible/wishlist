import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBotUserUpdates } from '$lib/server/bot-user-updates/use-cases/get.js';
import { GET } from '../+server.js';

vi.mock('@sveltejs/kit', () => ({ json: (original) => original }));
vi.mock('$lib/server/bot-user-updates/use-cases/get.js');

describe('bot userUpdates endpoint', () => {
  let url;

  beforeEach(() => {
    url = { searchParams: { get: vi.fn().mockReturnValue(null) } };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get bot user updates without parameters', () => {
    GET({ url });
    expect(
      vi.mocked(getBotUserUpdates),
    ).toHaveBeenCalledWith({
      timeLock: undefined,
      index: undefined,
      filters: undefined,
    });
  });

  it('should get bot user updates with parameters', () => {
    const timeLock = Math.round(Math.random() * 100);
    const index = Math.round(Math.random() * 100);
    const filters = { filter: 'value' };
    url.searchParams.get
      .mockReturnValueOnce(timeLock)
      .mockReturnValueOnce(index)
      .mockReturnValueOnce(JSON.stringify(filters));
    GET({ url });
    expect(vi.mocked(getBotUserUpdates)).toHaveBeenCalledWith({ timeLock, index, filters });
  });

  it('should return bot user updates', () => {
    vi.mocked(getBotUserUpdates).mockReturnValueOnce('bot user updates');
    expect(GET({ url })).toBe('bot user updates');
  });
});
