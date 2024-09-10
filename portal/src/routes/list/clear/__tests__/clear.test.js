// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { list } from '$lib/store/list';
import Clear from '../+page.svelte';

vi.mock('$app/navigation');
vi.mock(
  '$lib/card-swiper',
  async () => ({
    CardSwiper: await import('./mock.svelte').then((module) => module.default),
  }),
);
vi.mock('$lib/store/list', () => ({ list: writable(null) }));
vi.mock('$lib/store/user', () => ({ user: writable({ id: 'userid' }) }));
vi.stubGlobal('fetch', vi.fn());

describe('/list/clear', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should go to /list if list is empty', () => {
    vi.mocked(list).set([]);
    render(Clear);
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });

  it('should send request on destroy', () => {
    const { unmount } = render(Clear);
    unmount();
    expect(
      vi.mocked(fetch),
    ).toHaveBeenCalledWith(
      '/api/wishlist',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userid: 'userid', ids: [] }),
      },
    );
  });

  it('should go to /list if list is exhausted', async () => {
    vi.mocked(list).set([ 1 ]);
    const user = userEvent.setup();
    render(Clear);
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    await user.click(screen.getByTestId('swipe-right-button'));
    expect(vi.mocked(goto)).toHaveBeenCalledWith('/list');
  });
});
