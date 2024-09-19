// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { post } from '@tmible/wishlist-common/post';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated';
import Layout from '../+layout.svelte';

vi.mock('$app/navigation');
vi.mock(
  '$app/stores',
  async () => {
    const writable = await import('svelte/store').then(({ writable }) => writable);
    return { page: writable({ url: { pathname: 'pathname' } }) };
  },
);
vi.mock('@tmible/wishlist-common/post');
vi.mock(
  '$lib/components/gradient-switcher.svelte',
  async () => ({
    default: await import('./mock.svelte').then((module) => module.default),
  }),
);
vi.mock(
  '$lib/components/theme-switcher.svelte',
  async () => ({
    default: await import('./mock.svelte').then((module) => module.default),
  }),
);
vi.mock(
  '$lib/store/health-data.js',
  async () => {
    const writable = await import('svelte/store').then(({ writable }) => writable);
    return { healthData: writable({}) };
  },
);
vi.mock(
  '$lib/store/is-authenticated',
  async () => {
    const writable = await import('svelte/store').then(({ writable }) => writable);
    return { isAuthenticated: { ...writable(true), set: vi.fn() } };
  },
);

describe('dashboards layout', () => {
  beforeEach(async () => {
    post.mockReturnValue({ ok: true });
    const user = userEvent.setup();
    render(Layout);
    const logoutButton = screen.getByRole('button');
    await user.click(logoutButton);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should log user out', () => {
    expect(post).toHaveBeenCalledWith('/api/logout');
  });

  it('should set authenticated to false', () => {
    expect(isAuthenticated.set).toHaveBeenCalledWith(false);
  });

  it('should redirect to login page', () => {
    expect(goto).toHaveBeenCalledWith('/login');
  });
});
