// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { user } from '$lib/store/user';
import Landing from '../+page.svelte';

let browserMock = vi.hoisted(() => true);

vi.mock('$app/environment', () => ({
  get browser() {
    return browserMock;
  },
}));
vi.mock('$lib/store/breakpoints', () => ({ md: writable(true) }));
vi.mock('$lib/store/user', () => ({ user: writable({ isAuthenticated: true }) }));
vi.mock(
  '$lib/components/header.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../cards.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../cards-swiper.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);

describe('landing', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should send action on mount if user is not authenticated', () => {
    const fetchStub = vi.fn();
    vi.spyOn(Date, 'now').mockReturnValue('now');
    vi.stubGlobal('fetch', fetchStub);
    vi.mocked(user).set({ isAuthenticated: false });
    render(Landing);
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

  it('should be empty if not browser', () => {
    browserMock = false;
    vi.mocked(user).set({ isAuthenticated: false });
    const { container } = render(Landing);
    expect(container.children.length).toBe(0);
  });

  it('should be empty if user is authenticated', () => {
    browserMock = true;
    vi.mocked(user).set({ isAuthenticated: true });
    const { container } = render(Landing);
    expect(container.children.length).toBe(0);
  });

  it('should be displayed if browser and user is not authenticated', () => {
    browserMock = true;
    vi.mocked(user).set({ isAuthenticated: false });
    const { container } = render(Landing);
    expect(container.children.length).not.toBe(0);
  });
});
