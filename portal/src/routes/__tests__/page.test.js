// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { user } from '$lib/store/user';

vi.mock('svelte');
vi.mock('$lib/store/user', () => ({ user: writable({ isAuthenticated: true }) }));
vi.mock('$lib/store/breakpoints', () => ({ md: writable(true) }));

describe('landing', () => {
  beforeEach(() => {
    vi.doMock(
      '$lib/components/theme-switcher.svelte',
      async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
    );
    vi.doMock(
      '../cards.svelte',
      async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
    );
    vi.doMock(
      '../cards-swiper.svelte',
      async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    cleanup();
  });

  it('should send action on mount if user is not authenticated', async () => {
    let mountHandler;
    const fetchStub = vi.fn();
    vi.stubGlobal('Date', { now: vi.fn(() => 'now') });
    vi.stubGlobal('fetch', fetchStub);
    vi.mocked(user).set({ isAuthenticated: false });
    vi.mocked(onMount).mockImplementationOnce((handler) => mountHandler = handler);
    render(await import('../+page.svelte').then((module) => module.default));
    await mountHandler();
    expect(fetchStub).toHaveBeenCalledWith(
      '/api/actions',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({
          timestamp: 'now',
          action: 'landing visit',
        }),
      },
    );
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
});
