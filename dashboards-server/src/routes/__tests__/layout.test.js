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
import { isAuthenticated } from '$lib/store/is-authenticated.js';
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
      globalThis.jsdom.window,
      'matchMedia',
      {
        value: vi.fn().mockReturnValue(true),
        configurable: true,
      },
    );
  });

  afterEach(() => {
    delete globalThis.jsdom.window.matchMedia;
    vi.clearAllMocks();
    cleanup();
  });

  it('should provide theme service on create', () => {
    render(Layout);
    expect(
      provide,
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
      vi.spyOn(vi.mocked(isAuthenticated), 'set').mockImplementation(vi.fn());
      render(Layout);
    });

    it('should fetch authentication status', async () => {
      await mountHandler();
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/isAuthenticated');
    });

    it('should set authentication status to store', async () => {
      await mountHandler();
      expect(vi.mocked(isAuthenticated.set)).toHaveBeenCalledWith('response');
    });

    it('should init theme store', async () => {
      await mountHandler();
      expect(vi.mocked(initTheme)).toHaveBeenCalled();
    });
  });

  it('should not redirect if browser is false', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: false }));
    vi.doMock('$lib/store/is-authenticated.js', () => ({ isAuthenticated: writable(true) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/is-authenticated.js', () => ({ isAuthenticated: writable(null) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should redirect to /login', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/is-authenticated.js', () => ({ isAuthenticated: writable(false) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/dashboards' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/login');
  });

  it('should redirect to /dashboards', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/store/is-authenticated.js', () => ({ isAuthenticated: writable(true) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/login' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/dashboards');
  });
});
