// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { wishlist } from '$lib/wishlist/store.js';
import { deleteItems } from '$lib/wishlist/use-cases/delete-items.js';
import Clear from '../+page.svelte';

vi.mock('svelte', async (importOriginal) => ({ ...(await importOriginal()), getContext: vi.fn() }));
vi.mock('$app/navigation');
vi.mock(
  '$lib/card-swiper',
  async () => ({
    CardSwiper: await import('./mock.svelte').then((module) => module.default),
  }),
);
vi.mock('$lib/wishlist/store.js', () => ({ wishlist: writable(null) }));
vi.mock('$lib/wishlist/use-cases/delete-items.js');

describe('/list/clear', () => {
  beforeEach(() => {
    vi.mocked(getContext).mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should go to /list if wishlist is empty', async () => {
    const wishlistPromise = Promise.resolve();
    vi.mocked(getContext).mockReturnValueOnce(wishlistPromise);
    vi.mocked(wishlist).set([]);
    render(Clear);
    await wishlistPromise;
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });

  it('should delete items on destroy', () => {
    render(Clear).unmount();
    expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([]);
  });

  it('should go to /list if wishlist is exhausted', async () => {
    vi.mocked(wishlist).set([ 1 ]);
    const user = userEvent.setup();
    render(Clear);
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });

  describe('action buttons', () => {
    let unmount;
    let user;

    beforeEach(() => {
      vi.mocked(wishlist).set([{ id: 1 }]);
      user = userEvent.setup();
      ({ unmount } = render(Clear));
    });

    it('should mark item to deletion on button click', async () => {
      await user.click(screen.getByTestId('delete'));
      unmount();
      expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([ 1 ]);
    });

    it('should cancel on button click', async () => {
      await user.click(screen.getByTestId('swipe-left-button'));
      await user.click(screen.getByTestId('cancel'));
      unmount();
      expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([]);
    });

    it('should show hints on button click', async () => {
      await user.click(screen.getByTestId('show-hints'));
      expect(screen.getByTestId('hint')).toBeDefined();
    });

    it('should skip item on button click', async () => {
      await user.click(screen.getByTestId('save'));
      unmount();
      expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([]);
    });
  });
});
