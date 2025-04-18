// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { subscribe } from '@tmible/wishlist-common/event-bus';
import {
  initTheme,
  isDarkTheme,
  subscribeToTheme,
  updateTheme,
} from '@tmible/wishlist-common/theme-service';
import { readable, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { ThemeService } from '$lib/theme-service-injection-token.js';
import { Navigate } from '$lib/user/events.js';
import {
  NetworkService as UserNetworkService,
  Store as UserStore,
} from '$lib/user/injection-tokens.js';
import * as userNetworkService from '$lib/user/network.service.js';
import { user } from '$lib/user/store.js';
import { checkAuthentication } from '$lib/user/use-cases/check-authentication.js';
import Layout from '../+layout.svelte';

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-common/event-bus');
vi.mock(
  '@tmible/wishlist-common/theme-service',
  () => ({
    initTheme: vi.fn(),
    isDarkTheme: vi.fn(),
    subscribeToTheme: vi.fn(),
    updateTheme: vi.fn(),
  }),
);
vi.mock('$app/navigation');
vi.mock('$app/stores', () => ({ page: readable({ url: { pathname: '' } }) }));
vi.mock('$lib/user/use-cases/check-authentication.js');

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

  it('should provide theme service', () => {
    render(Layout);
    expect(
      vi.mocked(provide),
    ).toHaveBeenCalledWith(
      ThemeService,
      { isDarkTheme, subscribeToTheme, updateTheme },
    );
  });

  it('should provide user store', () => {
    render(Layout);
    expect(vi.mocked(provide)).toHaveBeenCalledWith(UserStore, user);
  });

  it('should provide user network service', () => {
    render(Layout);
    expect(vi.mocked(provide)).toHaveBeenCalledWith(UserNetworkService, userNetworkService);
  });

  describe('Navigate event', () => {
    let eventHandler;

    beforeEach(() => {
      vi.mocked(subscribe).mockImplementation((event, handler) => eventHandler = handler);
      render(Layout);
    });

    it('should subscribe to Navigate event', () => {
      expect(vi.mocked(subscribe)).toHaveBeenCalledWith(Navigate, expect.any(Function));
    });

    it('should not navigate to current page or subpage', () => {
      eventHandler('');
      expect(vi.mocked(goto)).not.toHaveBeenCalled();
    });

    it('should not navigate to current page or subpage', () => {
      eventHandler('route');
      expect(vi.mocked(goto)).toHaveBeenCalledWith('route');
    });
  });

  describe('on mount', () => {
    beforeEach(() => {
      render(Layout);
    });

    it('should init theme store', () => {
      expect(vi.mocked(initTheme)).toHaveBeenCalled();
    });

    it('should check authentication', () => {
      expect(vi.mocked(checkAuthentication)).toHaveBeenCalled();
    });
  });

  it('should not redirect if browser is false', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: false }));
    vi.doMock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: true }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: null }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).not.toHaveBeenCalled();
  });

  it('should redirect to /login', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: false }) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/dashboards' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/login');
  });

  it('should redirect to /dashboards', async () => {
    vi.resetModules();
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.doMock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: true }) }));
    vi.doMock('$app/stores', () => ({ page: writable({ url: { pathname: '/login' } }) }));
    render(await import('../+layout.svelte').then((module) => module.default));
    expect(goto).toHaveBeenCalledWith('/dashboards');
  });
});
