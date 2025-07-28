import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shareLink } from '../link.service.js';

describe('wishlist / link service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('link to bot', () => {
    it('should share', async () => {
      const share = vi.fn();
      vi.stubGlobal('navigator', { share });
      await shareLink({ classList: { add: vi.fn(), remove: vi.fn() } }, false, 'hash');
      expect(share).toHaveBeenCalledWith({ url: 'https://t.me/wishnibot?start=hash' });
    });

    it('should copy link', async () => {
      const writeText = vi.fn();
      vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(), clipboard: { writeText } });
      await shareLink({ classList: { add: vi.fn(), remove: vi.fn() } }, false, 'hash');
      expect(writeText).toHaveBeenCalledWith('https://t.me/wishnibot?start=hash');
    });
  });

  describe('link for groups', () => {
    it('should share', async () => {
      const share = vi.fn();
      vi.stubGlobal('navigator', { share });
      await shareLink({ classList: { add: vi.fn(), remove: vi.fn() } }, true, 'hash');
      expect(
        share,
      ).toHaveBeenCalledWith(
        { url: 'https://t.me/wishnibot?startgroup=hash' },
      );
    });

    it('should copy link', async () => {
      const writeText = vi.fn();
      vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(), clipboard: { writeText } });
      await shareLink({ classList: { add: vi.fn(), remove: vi.fn() } }, true, 'hash');
      expect(writeText).toHaveBeenCalledWith('https://t.me/wishnibot?startgroup=hash');
    });
  });

  it('should start animation', async () => {
    const add = vi.fn();
    vi.stubGlobal(
      'navigator',
      { share: vi.fn().mockRejectedValue(), clipboard: { writeText: vi.fn() } },
    );
    await shareLink({ classList: { add, remove: vi.fn() } }, Math.random() > 0.5, 'hash');
    expect(add).toHaveBeenCalledWith('clicked', 'relative');
  });

  it('should clean up', async () => {
    let classes;
    const add = vi.fn((...args) => classes = args);
    const remove = vi.fn();
    vi.stubGlobal(
      'navigator',
      { share: vi.fn().mockRejectedValue(), clipboard: { writeText: vi.fn() } },
    );
    await shareLink({ classList: { add, remove } }, Math.random() > 0.5, 'hash');
    await vi.runAllTimersAsync();
    expect(remove).toHaveBeenCalledWith(...classes);
  });
});
