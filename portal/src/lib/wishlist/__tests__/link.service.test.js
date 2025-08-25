import { toast } from 'svoast';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareLink } from '../link.service.js';

vi.mock('svoast');

describe('wishlist / link service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('link to bot', () => {
    it('should share', async () => {
      const share = vi.fn();
      vi.stubGlobal('navigator', { share });
      await shareLink(false, 'hash');
      expect(share).toHaveBeenCalledWith({ url: 'https://t.me/wishnibot?start=hash' });
    });

    it('should copy link', async () => {
      const writeText = vi.fn();
      vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(), clipboard: { writeText } });
      await shareLink(false, 'hash');
      expect(writeText).toHaveBeenCalledWith('https://t.me/wishnibot?start=hash');
    });
  });

  describe('link for groups', () => {
    it('should share', async () => {
      const share = vi.fn();
      vi.stubGlobal('navigator', { share });
      await shareLink(true, 'hash');
      expect(
        share,
      ).toHaveBeenCalledWith(
        { url: 'https://t.me/wishnibot?startgroup=hash' },
      );
    });

    it('should copy link', async () => {
      const writeText = vi.fn();
      vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(), clipboard: { writeText } });
      await shareLink(true, 'hash');
      expect(writeText).toHaveBeenCalledWith('https://t.me/wishnibot?startgroup=hash');
    });
  });

  it('should show toast', async () => {
    vi.stubGlobal(
      'navigator',
      { share: vi.fn().mockRejectedValue(), clipboard: { writeText: vi.fn() } },
    );
    await shareLink(Math.random() > 0.5, 'hash');
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Скопировано', { duration: 1000 });
  });
});
