// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '$lib/user/use-cases/logout.js';
import { shareLink } from '$lib/wishlist/use-cases/share-link.js';
import Menu from '../menu.svelte';

vi.mock('$lib/wishlist/store.js', () => ({ wishlist: writable([{}]) }));
vi.mock('$lib/user/use-cases/logout.js');
vi.mock('$lib/wishlist/use-cases/share-link.js');

describe('menu', () => {
  let user;
  let baseElement;

  beforeEach(() => {
    user = userEvent.setup();
    ({ baseElement } = render(Menu));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should share link on link to bot option click', async () => {
    await user.click(screen.getByTestId('share'));
    const option = screen.getByTestId('share-bot');
    await user.click(option);
    baseElement.innerHTML = '';
    expect(vi.mocked(shareLink)).toHaveBeenCalledWith(option, false);
  });

  it('should share link on link for groups option click', async () => {
    await user.click(screen.getByTestId('share'));
    const option = screen.getByTestId('share-group');
    await user.click(option);
    baseElement.innerHTML = '';
    expect(vi.mocked(shareLink)).toHaveBeenCalledWith(option, true);
  });

  it('should open link to bot on "to bot" option click', async () => {
    const spy = vi.spyOn(globalThis, 'open').mockImplementation(() => {});
    await user.click(screen.getByTestId('to-bot'));
    expect(spy).toHaveBeenCalledWith('https://t.me/tmible_wishlist_bot', '_blank');
  });

  it('should logout on logout option click', async () => {
    await user.click(screen.getByTestId('logout'));
    expect(vi.mocked(logout)).toHaveBeenCalled();
  });
});
