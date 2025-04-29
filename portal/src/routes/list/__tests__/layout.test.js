// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initCategoriesFeature } from '$lib/categories/initialization.js';
import { user } from '$lib/user/store.js';
import { initWishlistFeature } from '$lib/wishlist/initialization.js';
import { getList } from '$lib/wishlist/use-cases/get-list.js';
import Layout from '../+layout.svelte';

vi.mock('svelte', async (importOriginal) => ({ ...(await importOriginal()), setContext: vi.fn() }));
vi.mock('$lib/categories/initialization.js');
vi.mock('$lib/user/store.js', () => ({ user: writable({ id: 'userid', isAuthenticated: true }) }));
vi.mock('$lib/wishlist/initialization.js');
vi.mock('$lib/wishlist/use-cases/get-list.js');

describe('list layout', () => {
  beforeEach(() => {
    vi.mocked(initWishlistFeature).mockReturnValue(vi.fn());
    vi.mocked(initCategoriesFeature).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should init wishlist feature', () => {
    render(Layout);
    expect(vi.mocked(initWishlistFeature)).toHaveBeenCalled();
  });

  it('should init categories feature', () => {
    render(Layout);
    expect(vi.mocked(initCategoriesFeature)).toHaveBeenCalled();
  });

  it('should get wishlist on render', () => {
    render(Layout);
    expect(vi.mocked(getList)).toHaveBeenCalledWith();
  });

  it('should set get wishlist promise to context on render', () => {
    vi.mocked(getList).mockReturnValueOnce('promise');
    render(Layout);
    expect(vi.mocked(setContext)).toHaveBeenCalledWith('get wishlist promise', 'promise');
  });

  it('should not render children if user is not authenticated', () => {
    vi.mocked(user).set({ id: 'userid', isAuthenticated: false });
    const { container } = render(Layout);
    expect(container.children.length).toBe(0);
  });

  it('should render children if user is authenticated', () => {
    vi.mocked(user).set({ id: 'userid', isAuthenticated: true });
    const { container } = render(Layout);
    expect(container.innerHTML.trim()).not.toBe('');
  });

  describe('on destroy', () => {
    let destroyWishlistFeature;
    let destroyCategoriesFeature;

    beforeEach(() => {
      destroyWishlistFeature = vi.fn();
      destroyCategoriesFeature = vi.fn();
      vi.mocked(initWishlistFeature).mockReturnValueOnce(destroyWishlistFeature);
      vi.mocked(initCategoriesFeature).mockReturnValueOnce(destroyCategoriesFeature);
      render(Layout).unmount();
    });

    it('should destroy wishlist feature', () => {
      expect(destroyWishlistFeature).toHaveBeenCalled();
    });

    it('should destroy categories feature', () => {
      expect(destroyCategoriesFeature).toHaveBeenCalled();
    });
  });
});
