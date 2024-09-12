// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { user } from '$lib/store/user';
import { waitForElement } from '$lib/wait-for-element.js';

vi.mock('$lib/store/user', () => ({ user: writable({ isAuthenticated: true }) }));
vi.mock('$lib/wait-for-element.js');
vi.mock('svelte');

describe('landing', () => {
  beforeEach(() => {
    vi.doMock(
      '$lib/components/theme-switcher.svelte',
      async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    cleanup();
  });

  it('should be empty if not browser', async () => {
    vi.doMock('$app/environment', () => ({ browser: false }));
    vi.mocked(user).set({ isAuthenticated: false });
    const { container } = render(await import('../+page.svelte').then((module) => module.default));
    expect(container.innerHTML.trim()).toBe('');
  });

  it('should be empty if user is authenticated', async () => {
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.mocked(user).set({ isAuthenticated: true });
    const { container } = render(await import('../+page.svelte').then((module) => module.default));
    expect(container.innerHTML.trim()).toBe('');
  });

  it('should be displayed if browser and user is not authenticated', async () => {
    vi.doMock('$app/environment', () => ({ browser: true }));
    vi.mocked(user).set({ isAuthenticated: false });
    const { container } = render(await import('../+page.svelte').then((module) => module.default));
    expect(container.innerHTML.trim()).not.toBe('');
  });

  describe('on mount', () => {
    let mountHandler;
    const mockElement = document.createElement('div');
    const append = vi.fn();

    beforeEach(async () => {
      vi.spyOn(document, 'querySelector').mockReturnValue({ append });
      vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
      vi.mocked(waitForElement).mockResolvedValue(mockElement);
      render(await import('../+page.svelte').then((module) => module.default));
      await mountHandler();
    });

    it('should wait for telegram login widget', () => {
      expect(
        vi.mocked(waitForElement),
      ).toHaveBeenCalledWith(
        '[id="telegram-login-tmible_wishlist_bot"]',
        document.head,
      );
    });

    it('should replace telegram login widget', () => {
      expect(append).toHaveBeenCalledWith(mockElement);
    });
  });
});
