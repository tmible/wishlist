// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { provide } from '@tmible/wishlist-common/dependency-injector';
import {
  initTheme,
  isDarkTheme,
  subscribeToTheme,
  updateTheme,
} from '@tmible/wishlist-common/theme-service';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { initActionsFeature } from '$lib/actions/initialization.js';
import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
import { ThemeService } from '$lib/theme-service-injection-token.js';
import { initUnknownUserUuid } from '$lib/unknown-user-uuid';
import { initUserFeature } from '$lib/user/initialization.js';
import { user } from '$lib/user/store.js';
import { initialize } from '$lib/user/use-cases/initialize.js';
import Layout from '../+layout.svelte';

const page = vi.hoisted(() => ({ url: { pathname: '' } }));

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
vi.mock('$app/state', () => ({ page }));
vi.mock('$lib/actions/initialization.js');
vi.mock('$lib/unknown-user-uuid');
vi.mock('$lib/user/initialization.js');
vi.mock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: null }) }));
vi.mock('$lib/user/use-cases/initialize.js');

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
    vi.mocked(initUserFeature).mockReturnValue(vi.fn());
    vi.mocked(initActionsFeature).mockReturnValue(vi.fn());
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
      ThemeService,
      { isDarkTheme, subscribeToTheme, updateTheme },
    );
  });

  it('should init user feature', () => {
    render(Layout);
    expect(vi.mocked(initUserFeature)).toHaveBeenCalled();
  });

  it('should init actions feature', () => {
    render(Layout);
    expect(vi.mocked(initActionsFeature)).toHaveBeenCalled();
  });

  it('should initialize unknown user UUID', () => {
    render(Layout);
    expect(vi.mocked(initUnknownUserUuid)).toHaveBeenCalled();
  });

  describe('on mount', () => {
    beforeEach(() => {
      render(Layout);
    });

    it('should init theme store', () => {
      expect(vi.mocked(initTheme)).toHaveBeenCalled();
    });

    it('should initialize user', () => {
      expect(vi.mocked(initialize)).toHaveBeenCalled();
    });
  });

  describe('on destroy', () => {
    let destroyTheme;
    let destroyUserFeature;
    let destroyActionsFeature;

    beforeEach(() => {
      destroyTheme = vi.fn();
      destroyUserFeature = vi.fn();
      destroyActionsFeature = vi.fn();
      vi.mocked(initTheme).mockReturnValueOnce(destroyTheme);
      vi.mocked(initUserFeature).mockReturnValueOnce(destroyUserFeature);
      vi.mocked(initActionsFeature).mockReturnValueOnce(destroyActionsFeature);
      render(Layout).unmount();
    });

    it('should destroy theme store', () => {
      expect(destroyTheme).toHaveBeenCalled();
    });

    it('should destroy user feature', () => {
      expect(destroyUserFeature).toHaveBeenCalled();
    });

    it('should destroy actions feature', () => {
      expect(destroyActionsFeature).toHaveBeenCalled();
    });
  });

  it('should not redirect if isAuthenticated is null', async () => {
    vi.mocked(user).set({ isAuthenticated: null });
    render(Layout);
    await vi.waitFor(() => expect(goto).not.toHaveBeenCalled());
  });

  it('should redirect to /', async () => {
    vi.mocked(user).set({ isAuthenticated: false });
    page.url.pathname = AUTHENTICATED_ROUTE;
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith(UNAUTHENTICATED_ROUTE));
  });

  it('should redirect to /list', async () => {
    vi.mocked(user).set({ isAuthenticated: true });
    page.url.pathname = UNAUTHENTICATED_ROUTE;
    render(Layout);
    await vi.waitFor(() => expect(goto).toHaveBeenCalledWith(AUTHENTICATED_ROUTE));
  });
});
