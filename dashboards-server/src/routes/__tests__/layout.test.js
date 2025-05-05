// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { inject } from '@tmible/wishlist-common/dependency-injector';
import { initThemeFeature } from '@tmible/wishlist-ui/theme/initialization';
import { ThemeService } from '@tmible/wishlist-ui/theme/injection-tokens';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { initUserFeature } from '$lib/user/initialization.js';
import { user } from '$lib/user/store.js';
import { checkAuthentication } from '$lib/user/use-cases/check-authentication.js';
import Layout from '../+layout.svelte';

const page = vi.hoisted(() => ({ url: { pathname: '' } }));

vi.mock('@tmible/wishlist-common/dependency-injector');
vi.mock('@tmible/wishlist-ui/theme/initialization');
vi.mock('@tmible/wishlist-ui/theme/injection-tokens', () => ({ ThemeService: 'theme service' }));
vi.mock('$app/navigation');
vi.mock('$app/state', () => ({ page }));
vi.mock('$lib/user/initialization.js');
vi.mock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: null }) }));
vi.mock('$lib/user/use-cases/check-authentication.js');

const initTheme = vi.fn().mockReturnValue(vi.fn());

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
    vi.mocked(inject).mockReturnValueOnce({ initTheme });
    vi.mocked(initUserFeature).mockReturnValue(vi.fn());
    vi.mocked(initThemeFeature).mockReturnValue(vi.fn());
    vi.mocked(user).set({ isAuthenticated: null });
  });

  afterEach(() => {
    delete globalThis.jsdom.window.matchMedia;
    vi.clearAllMocks();
    cleanup();
  });

  it('should init theme feature', () => {
    render(Layout);
    expect(vi.mocked(initThemeFeature)).toHaveBeenCalled();
  });

  it('should init user feature', () => {
    render(Layout);
    expect(vi.mocked(initUserFeature)).toHaveBeenCalled();
  });

  describe('on mount', () => {
    beforeEach(() => {
      render(Layout);
    });

    it('should inject theme service', () => {
      expect(vi.mocked(inject)).toHaveBeenCalled(vi.mocked(ThemeService));
    });

    it('should init theme', () => {
      expect(initTheme).toHaveBeenCalled();
    });

    it('should check authentication', () => {
      expect(vi.mocked(checkAuthentication)).toHaveBeenCalled();
    });
  });

  describe('on destroy', () => {
    it('should destroy theme', () => {
      const destroyTheme = vi.fn();
      initTheme.mockReturnValueOnce(destroyTheme);
      render(Layout).unmount();
      expect(destroyTheme).toHaveBeenCalled();
    });

    it('should destroy theme feature', () => {
      const destroyThemeFeature = vi.fn();
      vi.mocked(initThemeFeature).mockReturnValueOnce(destroyThemeFeature);
      render(Layout).unmount();
      expect(destroyThemeFeature).toHaveBeenCalled();
    });

    it('should destroy user feature', () => {
      const destroyUserFeature = vi.fn();
      vi.mocked(initUserFeature).mockReturnValueOnce(destroyUserFeature);
      render(Layout).unmount();
      expect(destroyUserFeature).toHaveBeenCalled();
    });
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.mocked(user).set({ isAuthenticated: null });
    render(Layout);
    await vi.waitFor(() => expect(goto).not.toHaveBeenCalled());
  });

  it('should redirect to /login', async () => {
    vi.mocked(user).set({ isAuthenticated: false });
    page.url.pathname = '/dashboards';
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith('/login'));
  });

  it('should redirect to /dashboards', async () => {
    vi.mocked(user).set({ isAuthenticated: true });
    page.url.pathname = '/login';
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith('/dashboards'));
  });
});
