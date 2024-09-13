/* eslint-disable no-undef -- jsdom -- глобальная переменная тестового окружения */
// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import {
  initTheme,
  isDarkTheme,
  subscribeToTheme,
  updateTheme,
} from '@tmible/wishlist-common/theme-service';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { InjectionToken } from '$lib/architecture/injection-token';
import { user } from '$lib/store/user';
import Layout from '../+layout.svelte';

vi.mock('svelte');
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

describe('layout', () => {
  beforeEach(() => {
    Object.defineProperty(
      jsdom.window,
      'matchMedia',
      {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
      },
    );
  });

  afterEach(() => {
    delete jsdom.window.matchMedia;
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

  describe('on mount', () => {
    let mountHandler;

    beforeEach(() => {
      vi.mocked(onMount).mockImplementation((handler) => mountHandler = handler);
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn(() => 'response') }));
      vi.spyOn(vi.mocked(user), 'set').mockImplementation(vi.fn());
      render(Layout);
    });

    it('should fetch user', async () => {
      await mountHandler();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/user');
    });

    it('should set user to store', async () => {
      await mountHandler();
      expect(vi.mocked(user.set)).toHaveBeenCalledWith('response');
    });

    it('should init theme store', async () => {
      await mountHandler();
      expect(vi.mocked(initTheme)).toHaveBeenCalled();
    });
  });

  it('should not redirect if browser is false', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: false }));
    vi.doMock('$lib/store/user', () => ({ user: writable({ isAuthenticated: true }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/user', () => ({ user: writable({ isAuthenticated: null }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should redirect to /', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/user', () => ({ user: writable({ isAuthenticated: false }) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/list' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/');
  });

  it('should redirect to /list', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/user', () => ({ user: writable({ isAuthenticated: true }) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/list');
  });
});
/* eslint-enable no-undef */
