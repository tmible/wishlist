// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import {
  initTheme,
  isDarkTheme,
  subscribeToTheme,
  updateTheme,
} from '@tmible/wishlist-common/theme-service';
import { get, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { InjectionToken } from '$lib/architecture/injection-token';
import { user } from '$lib/store/user';
import { initUnknownUserUuid } from '$lib/unknown-user-uuid';
import Layout from '../+layout.svelte';

vi.mock('$app/navigation');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock(
  '@tmible/wishlist-common/theme-service',
  () => ({
    initTheme: vi.fn(),
    isDarkTheme: vi.fn(),
    subscribeToTheme: vi.fn(),
    updateTheme: vi.fn(),
  }),
);
vi.mock('$app/stores', () => ({ page: writable({ url: { pathname: '' } }) }));
vi.mock('$lib/store/user', () => ({ user: writable({ isAuthenticated: null }) }));
vi.mock('$lib/unknown-user-uuid');

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({ json: vi.fn(() => ({ response: 'response' })) }),
);

describe('layout', () => {
  beforeEach(() => {
    Object.defineProperty(
      globalThis.jsdom.window,
      'matchMedia',
      {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
      },
    );
    vi.mocked(user).set({ isAuthenticated: null });
  });

  afterEach(() => {
    delete globalThis.jsdom.window.matchMedia;
    vi.clearAllMocks();
    cleanup();
  });

  it('should provide theme service on create', () => {
    render(Layout);
    expect(
      vi.mocked(provide),
    ).toHaveBeenCalledWith(
      InjectionToken.ThemeService,
      { isDarkTheme, subscribeToTheme, updateTheme },
    );
  });

  it('should initialize unknown user UUID', () => {
    render(Layout);
    expect(vi.mocked(initUnknownUserUuid)).toHaveBeenCalled();
  });

  describe('on mount', () => {
    beforeEach(() => {
      vi.spyOn(vi.mocked(user), 'set').mockImplementationOnce(vi.fn());
      render(Layout);
    });

    it('should fetch user', () => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user');
    });

    it('should set user to store', () => {
      expect(vi.mocked(user.set)).toHaveBeenCalledWith({
        ...get(vi.mocked(user)),
        response: 'response',
      });
    });

    it('should init theme store', () => {
      expect(vi.mocked(initTheme)).toHaveBeenCalled();
    });
  });

  describe('on destroy', () => {
    let destroyTheme;

    beforeEach(() => {
      destroyTheme = vi.fn();
      vi.mocked(initTheme).mockReturnValueOnce(destroyTheme);
      render(Layout).unmount();
    });

    it('should destroy theme store', () => {
      expect(destroyTheme).toHaveBeenCalled();
    });
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.mocked(user).set({ isAuthenticated: null });
    render(Layout);
    await vi.waitFor(() => expect(goto).not.toHaveBeenCalled());
  });

  it('should redirect to /', async () => {
    vi.mocked(user).set({ isAuthenticated: false });
    vi.mocked(page).set({ url: { pathname: '/list' } });
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith('/'));
  });

  it('should redirect to /list', async () => {
    vi.mocked(user).set({ isAuthenticated: true });
    vi.mocked(page).set({ url: { pathname: '/' } });
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith('/list'));
  });
});
