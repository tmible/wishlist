// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initWishlistFeature } from '$lib/wishlist/initialization.js';
import Add from '../+page.svelte';

vi.mock('$lib/components/header.svelte', async () => await import('./mock.svelte'));
vi.mock('$lib/wishlist/components/item-form.svelte', async () => await import('./mock.svelte'));
vi.mock('$lib/wishlist/initialization.js');

describe('add page', () => {
  beforeEach(() => {
    vi.mocked(initWishlistFeature).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed without "wishlist" search param', () => {
    expect(render(Add).baseElement.innerHTML).toMatchSnapshot();
  });

  it('should be displayed with "wishlist" search param', () => {
    vi.spyOn(URLSearchParams.prototype, 'get').mockReturnValueOnce('param');
    expect(render(Add).baseElement.innerHTML).toMatchSnapshot();
  });

  it('should init wishlist feature', () => {
    render(Add);
    expect(vi.mocked(initWishlistFeature)).toHaveBeenCalled();
  });

  it('should destroy wishlist feature', () => {
    const destroyWishlistFeature = vi.fn();
    vi.mocked(initWishlistFeature).mockReturnValueOnce(destroyWishlistFeature);
    render(Add).unmount();
    expect(destroyWishlistFeature).toHaveBeenCalled();
  });
});
