// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendAction } from '$lib/actions/use-cases/send-action.js';
import { user } from '$lib/user/store.js';
import Landing from '../+page.svelte';

let browserMock = vi.hoisted(() => true);

vi.mock('$app/environment', () => ({
  get browser() {
    return browserMock;
  },
}));
vi.mock('$lib/actions/use-cases/send-action.js');
vi.mock('$lib/breakpoints.js', () => ({ md: writable(true) }));
vi.mock('$lib/user/store.js', () => ({ user: writable({ isAuthenticated: true }) }));
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
    vi.mocked(user).set({ isAuthenticated: false });
    render(Landing);
    expect(vi.mocked(sendAction)).toHaveBeenCalledWith('landing visit');
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
