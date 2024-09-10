// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import { isDarkTheme, subscribeToTheme, updateTheme } from '@tmible/wishlist-common/theme-service';
import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { InjectionToken } from '$lib/architecture/injection-token';
import { isAuthenticated } from '$lib/store/is-authenticated.js';
import Layout from '../+layout.svelte';

const fetchMock = vi.fn(() => Promise.resolve({ status: 200, json: () => {} }));

vi.stubGlobal('fetch', fetchMock);
vi.mock('$app/stores', async () => {
  const writable = await import('svelte/store').then(({ writable }) => writable);
  return { page: writable({ url: { pathname: 'path' } }) };
});
vi.mock('$app/navigation');
vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock(
  '@tmible/wishlist-common/theme-service',
  () => ({ isDarkTheme: vi.fn(), subscribeToTheme: vi.fn(), updateTheme: vi.fn() }),
);

describe('layout', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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
    it('should fetch authentication status', () => {
      render(Layout);
      expect(fetch).toHaveBeenCalledWith('/api/isAuthenticated');
    });

    it('should set authentication status to store', async () => {
      fetchMock.mockReturnValue(Promise.resolve({ status: 200, json: () => 'response' }));
      render(Layout);
      await vi.waitUntil(() => get(isAuthenticated) !== undefined);
      expect(get(isAuthenticated)).toEqual('response');
    });
  });

  it('should not redirect if isAuthenticated is null', () => {
    isAuthenticated.set(null);
    render(Layout);
    expect(goto).not.toHaveBeenCalled();
  });

  it('should redirect to /login', () => {
    isAuthenticated.set(false);
    page.set({ url: { pathname: '/dashboards' } });
    render(Layout);
    expect(goto).toHaveBeenCalledWith('/login');
  });

  it('should redirect to /dashboards', () => {
    isAuthenticated.set(true);
    page.set({ url: { pathname: '/login' } });
    render(Layout);
    expect(goto).toHaveBeenCalledWith('/dashboards');
  });
});
