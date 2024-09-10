// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { post } from '@tmible/wishlist-common/post';
import { writable } from 'svelte/store';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { user as userStore } from '$lib/store/user';

vi.mock('$app/navigation');
vi.mock('$lib/store/list', () => ({ list: writable([{}]) }));
vi.mock('$lib/store/user', () => ({ user: writable({ id: 'userid' }) }));
vi.mock('@tmible/wishlist-common/post');

describe('menu', () => {
  let dispatchSpies;
  let user;
  let baseElement;

  beforeAll(() => {
    dispatchSpies = [];
    vi.doMock(
      'svelte',
      async (importOriginal) => {
        const original = await importOriginal();
        return {
          ...original,
          createEventDispatcher: () => {
            const spy = vi.fn(original.createEventDispatcher());
            dispatchSpies.push(spy);
            return spy;
          },
        };
      },
    );
  });

  beforeEach(async () => {
    user = userEvent.setup();
    ({ baseElement } = render(await import('../menu.svelte').then((module) => module.default)));
  });

  afterEach(() => {
    dispatchSpies = [];
    vi.clearAllMocks();
    cleanup();
  });

  it('should dispatch add event on add option click', async () => {
    await user.click(screen.getByTestId('add'));
    expect(dispatchSpies[0]).toHaveBeenCalledWith('add');
  });

  it('should dispatch clear event on clear option click', async () => {
    await user.click(screen.getByTestId('clear'));
    expect(dispatchSpies[0]).toHaveBeenCalledWith('clear');
  });

  describe('on link to bot option click', () => {
    afterEach(() => {
      baseElement.innerHTML = '';
    });

    it('should share', async () => {
      Object.defineProperty(navigator, 'share', { value: vi.fn(), configurable: true });
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-bot'));
      expect(
        vi.mocked(navigator.share),
      ).toHaveBeenCalledWith({
        url: 'https://t.me/tmible_wishlist_bot?start=userid',
      });
      delete navigator.share;
    });

    it('should copy link', async () => {
      vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-bot'));
      expect(
        vi.mocked(navigator.clipboard.writeText),
      ).toHaveBeenCalledWith(
        'https://t.me/tmible_wishlist_bot?start=userid',
      );
    });

    it('should start animation', async () => {
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-bot');
      vi.spyOn(option.classList, 'add');
      await user.click(option);
      expect(option.classList.add).toHaveBeenCalled();
    });

    it('should clean up', async () => {
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      vi.useFakeTimers();
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-bot');
      let classes;
      vi.spyOn(option.classList, 'add').mockImplementation((...args) => classes = args);
      vi.spyOn(option.classList, 'remove');
      await user.click(option);
      vi.runAllTimers();
      expect(option.classList.remove).toHaveBeenCalledWith(...classes);
      vi.useRealTimers();
    });
  });

  describe('on link for groups option click', () => {
    afterEach(() => {
      baseElement.innerHTML = '';
    });

    it('should share', async () => {
      Object.defineProperty(navigator, 'share', { value: vi.fn(), configurable: true });
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-group'));
      expect(
        vi.mocked(navigator.share),
      ).toHaveBeenCalledWith({
        url: 'https://t.me/tmible_wishlist_bot?startgroup=userid',
      });
      delete navigator.share;
    });

    it('should copy link', async () => {
      vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-group'));
      expect(
        vi.mocked(navigator.clipboard.writeText),
      ).toHaveBeenCalledWith(
        'https://t.me/tmible_wishlist_bot?startgroup=userid',
      );
    });

    it('should start animation', async () => {
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-group');
      vi.spyOn(option.classList, 'add');
      await user.click(option);
      expect(option.classList.add).toHaveBeenCalled();
    });

    it('should clean up', async () => {
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      vi.useFakeTimers();
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-group');
      let classes;
      vi.spyOn(option.classList, 'add').mockImplementation((...args) => classes = args);
      vi.spyOn(option.classList, 'remove');
      await user.click(option);
      vi.runAllTimers();
      expect(option.classList.remove).toHaveBeenCalledWith(...classes);
      vi.useRealTimers();
    });
  });

  it('should open link to bot on "to bot" option click', async () => {
    const spy = vi.spyOn(global, 'open').mockImplementation(() => {});
    await user.click(screen.getByTestId('to-bot'));
    expect(spy).toHaveBeenCalledWith('https://t.me/tmible_wishlist_bot', '_blank');
  });

  describe('on logout option click', () => {
    beforeEach(async () => {
      vi.mocked(post).mockResolvedValue({ ok: true });
      vi.spyOn(vi.mocked(userStore), 'set').mockImplementation(vi.fn());
      await user.click(screen.getByTestId('logout'));
    });

    it('should send request', () => {
      expect(vi.mocked(post)).toHaveBeenCalledWith('/api/logout');
    });

    it('should reset user store if response is ok', () => {
      expect(vi.mocked(userStore.set)).toHaveBeenCalledWith({ id: null, isAuthenticated: false });
    });

    it('should go to landing if response is ok', () => {
      expect(vi.mocked(goto)).toHaveBeenCalledWith('/');
    });
  });
});
