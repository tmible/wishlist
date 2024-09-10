// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { post } from '@tmible/wishlist-common/post';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { isAuthenticated } from '$lib/store/is-authenticated';
import Dashboards from '../+page.svelte';

vi.mock('$app/navigation');
vi.mock('@tmible/wishlist-common/post');
vi.mock('$lib/components/gradient-switcher.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('$lib/components/theme-switcher.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('$lib/components/user-sessions-table', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('$lib/store/is-authenticated', async () => {
  const writable = await import('svelte/store').then(({ writable }) => writable);
  return { isAuthenticated: { ...writable(true), set: vi.fn() } };
});
vi.mock('../active-users-dashboard.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('../success-rate-dashboard.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));
vi.mock('../time-dashboard.svelte', async () => ({
  default: await import('./mock.svelte').then((module) => module.default),
}));

describe('dashboards', () => {
  beforeEach(async () => {
    post.mockReturnValue({ ok: true });
    const user = userEvent.setup();
    render(
      Dashboards,
      {
        data: {
          timeDashboard: [],
          activeUsersDashboard: [],
          successRate: null,
          userSessions: [],
        },
      },
    );
    const logoutButton = screen.getByRole('button');
    await user.click(logoutButton);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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
