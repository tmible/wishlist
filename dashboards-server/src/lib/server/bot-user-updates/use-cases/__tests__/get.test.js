import { emit } from '@tmible/wishlist-common/event-bus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountBotUserUpdates, GetBotUserUpdates } from '../../events.js';
import { getBotUserUpdates } from '../get.js';

vi.mock('@tmible/wishlist-common/event-bus');
vi.mock('../statements/count.js');
vi.mock('../statements/get.js');

describe('bot user updates / use cases / get', () => {
  const page = [ 'page' ];

  let index;
  let total;

  beforeEach(() => {
    index = Math.round(Math.random() * 100);
    total = Math.random();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit GetBotUserUpdates event', () => {
    getBotUserUpdates({ timeLock: 'timeLock', index: 'index', filters: 'filters' });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(GetBotUserUpdates, 'timeLock', 'index', 'filters');
  });

  it('should emit CountBotUserUpdates event', () => {
    getBotUserUpdates({ timeLock: 'timeLock', index: 'index', filters: 'filters' });
    expect(vi.mocked(emit)).toHaveBeenCalledWith(CountBotUserUpdates, 'timeLock', 'filters');
  });

  describe('retry until page is not empty', () => {
    beforeEach(() => {
      vi.mocked(emit)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce(page)
        .mockReturnValueOnce(total);
    });

    it('should retry until page is not empty', () => {
      getBotUserUpdates({ index: 10 });
      expect(vi.mocked(emit)).toHaveBeenCalledTimes(4);
    });

    it('should return after retry', () => {
      expect(getBotUserUpdates({ index: 10 })).toEqual({ page, index: 8, total });
    });
  });

  describe('retry until index is zero', () => {
    beforeEach(() => {
      vi.mocked(emit).mockReturnValue([]);
    });

    it('should retry until index is zero', () => {
      getBotUserUpdates({ index });
      expect(vi.mocked(emit)).toHaveBeenCalledTimes(index + 2);
    });

    it('should return after retry', () => {
      expect(getBotUserUpdates({ index })).toEqual({ page: [], index: 0, total: [] });
    });
  });

  it('should return bot user updates', () => {
    vi.mocked(emit).mockReturnValueOnce(page).mockReturnValueOnce(total);
    expect(getBotUserUpdates({ index })).toEqual({ page, index, total });
  });
});
