// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { post } from '@tmible/wishlist-common/post';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { user as userStore } from '$lib/store/user';
import Menu from '../menu.svelte';

vi.mock('$app/navigation');
vi.mock('$lib/store/list', () => ({ list: writable([{}]) }));
vi.mock(
  '$lib/store/user',
  () => ({ user: writable({ id: 'userid', hash: 'hash', something: 'other' }) }),
);
vi.mock('@tmible/wishlist-common/post');

const setUpCommonContext = () => {
  vi.mocked(userStore).set({ id: 'userid', hash: 'hash', something: 'other' });
};

describe('menu', () => {
  let user;
  let baseElement;

  beforeEach(() => {
    setUpCommonContext();
    user = userEvent.setup();
    ({ baseElement } = render(Menu));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('on link to bot option click', () => {
    afterEach(() => {
      baseElement.innerHTML = '';
    });

    describe('if hash is null', () => {
      beforeEach(async () => {
        vi.mocked(userStore).set({ id: 'userid', hash: null, something: 'other' });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: vi.fn(() => 'hash') }));
        vi.spyOn(userStore, 'set').mockImplementation(vi.fn());
        await user.click(screen.getByTestId('share'));
        await user.click(screen.getByTestId('share-bot'));
      });

      // restore common context
      afterEach(() => {
        vi.mocked(userStore.set).mockRestore();
        setUpCommonContext();
      });

      it('should fetch it', () => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user/hash');
      });

      it('should patch user store', () => {
        expect(
          vi.mocked(userStore.set),
        ).toHaveBeenCalledWith(
          { id: 'userid', hash: 'hash', something: 'other' },
        );
      });
    });

    it('should share', async () => {
      Object.defineProperty(navigator, 'share', { value: vi.fn(), configurable: true });
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-bot'));
      expect(
        vi.mocked(navigator.share),
      ).toHaveBeenCalledWith({
        url: 'https://t.me/tmible_wishlist_bot?start=hash',
      });
      delete navigator.share;
    });

    it('should copy link', async () => {
      Object.defineProperty(
        navigator,
        'share',
        { value: vi.fn().mockRejectedValue(), configurable: true },
      );
      vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-bot'));
      expect(
        vi.mocked(navigator.clipboard.writeText),
      ).toHaveBeenCalledWith(
        'https://t.me/tmible_wishlist_bot?start=hash',
      );
      delete navigator.share;
    });

    it('should start animation', async () => {
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-bot');
      vi.spyOn(option.classList, 'add');
      await user.click(option);
      expect(option.classList.add).toHaveBeenCalled();
    });

    it('should clean up', async () => {
      await user.click(screen.getByTestId('share')).then(() => {
        user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      });
      vi.useFakeTimers();
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

    describe('if hash is null', () => {
      beforeEach(async () => {
        vi.mocked(userStore).set({ id: 'userid', hash: null, something: 'other' });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ text: vi.fn(() => 'hash') }));
        vi.spyOn(userStore, 'set').mockImplementation(vi.fn());
        await user.click(screen.getByTestId('share'));
        await user.click(screen.getByTestId('share-group'));
      });

      afterEach(() => {
        vi.mocked(userStore.set).mockRestore();
        setUpCommonContext();
      });

      it('should fetch it', () => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user/hash');
      });

      it('should patch user store', () => {
        expect(
          vi.mocked(userStore.set),
        ).toHaveBeenCalledWith(
          { id: 'userid', hash: 'hash', something: 'other' },
        );
      });
    });

    it('should share', async () => {
      Object.defineProperty(navigator, 'share', { value: vi.fn(), configurable: true });
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-group'));
      expect(
        vi.mocked(navigator.share),
      ).toHaveBeenCalledWith({
        url: 'https://t.me/tmible_wishlist_bot?startgroup=hash',
      });
      delete navigator.share;
    });

    it('should copy link', async () => {
      Object.defineProperty(
        navigator,
        'share',
        { value: vi.fn().mockRejectedValue(), configurable: true },
      );
      vi.spyOn(navigator.clipboard, 'writeText');
      await user.click(screen.getByTestId('share'));
      await user.click(screen.getByTestId('share-group'));
      expect(
        vi.mocked(navigator.clipboard.writeText),
      ).toHaveBeenCalledWith(
        'https://t.me/tmible_wishlist_bot?startgroup=hash',
      );
      delete navigator.share;
    });

    it('should start animation', async () => {
      await user.click(screen.getByTestId('share'));
      const option = screen.getByTestId('share-group');
      vi.spyOn(option.classList, 'add');
      await user.click(option);
      expect(option.classList.add).toHaveBeenCalled();
    });

    it('should clean up', async () => {
      await user.click(screen.getByTestId('share')).then(() => {
        user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      });
      vi.useFakeTimers();
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
    const spy = vi.spyOn(globalThis, 'open').mockImplementation(() => {});
    await user.click(screen.getByTestId('to-bot'));
    expect(spy).toHaveBeenCalledWith('https://t.me/tmible_wishlist_bot', '_blank');
  });

  describe('on logout option click', () => {
    beforeEach(async () => {
      vi.mocked(post).mockResolvedValue({ ok: true });
      vi.spyOn(userStore, 'set').mockImplementation(vi.fn());
      await user.click(screen.getByTestId('logout'));
    });

    afterEach(() => {
      vi.mocked(userStore.set).mockRestore();
    });

    it('should send request', () => {
      expect(vi.mocked(post)).toHaveBeenCalledWith('/api/logout');
    });

    it('should reset user store if response is ok', () => {
      expect(
        vi.mocked(userStore.set),
      ).toHaveBeenCalledWith(
        { id: null, hash: 'hash', isAuthenticated: false, something: 'other' },
      );
    });

    it('should go to landing if response is ok', () => {
      expect(vi.mocked(goto)).toHaveBeenCalledWith('/');
    });
  });
});
