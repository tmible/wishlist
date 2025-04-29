// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { wishlist } from '$lib/wishlist/store.js';
import { deleteItems } from '$lib/wishlist/use-cases/delete-items.js';
import Clear from '../+page.svelte';

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
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should go to /list if list is empty', () => {
    vi.mocked(wishlist).set([]);
    render(Clear);
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });

  it('should delete items on destroy', () => {
    render(Clear).unmount();
    expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([]);
  });

  it('should go to /list if list is exhausted', async () => {
    vi.mocked(wishlist).set([ 1 ]);
    const user = userEvent.setup();
    render(Clear);
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });
});
