// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { list } from '$lib/store/list';
import { user } from '$lib/store/user';
import List from '../+page.svelte';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: vi.fn(() => []) }));
vi.mock('sortablejs');
vi.mock(
  '$lib/components/theme-switcher.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../list-item-add-dialog.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../list-item-card.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../list-item-delete-alert.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../menu.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock('$lib/store/list', () => ({ list: writable(null) }));
vi.mock('$lib/store/user', () => ({ user: writable({ id: 'userid', isAuthenticated: true }) }));

describe('list page', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should not be displayed if user is not authenticated', () => {
    vi.mocked(user).set({ id: 'userid', isAuthenticated: false });
    const { container } = render(List);
    expect(container.innerHTML.trim()).toBe('');
  });

  describe('if user is authenticated', () => {
    beforeEach(() => {
      vi.mocked(user).set({ id: 'userid', isAuthenticated: true });
    });

    it('should be displayed', () => {
      const { container } = render(List);
      expect(container.innerHTML.trim()).not.toBe('');
    });

    it('should request list on render', () => {
      render(List);
      expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist');
    });

    it('should save list to store', async () => {
      vi.mocked(fetch).mockResolvedValue({ json: vi.fn(() => 'response') });
      vi.spyOn(vi.mocked(list), 'set').mockImplementation(vi.fn());
      render(List);
      await waitFor(() => expect(vi.mocked(list.set)).toHaveBeenCalledWith('response'));
    });

    it('should display skeletons while list is requested', () => {
      vi.mocked(fetch).mockImplementation(async () => {
        const skeletons = await screen.findAllByText('Skeleton mock');
        expect(skeletons.length).toBeGreaterThan(0);
        return { json: vi.fn(() => 'response') };
      });
      render(List);
    });

    it('should display empty list message', async () => {
      vi.mocked(fetch).mockResolvedValue({ json: vi.fn(() => []) });
      render(List);
      expect(await screen.findByText('Ваш список пуст')).toBeDefined();
    });

    it('should display list', async () => {
      vi.resetModules();
      vi.doMock(
        '$lib/components/theme-switcher.svelte',
        async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
      );
      vi.doMock(
        '../list-item-add-dialog.svelte',
        async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
      );
      vi.doMock(
        '../list-item-card.svelte',
        async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
      );
      vi.doMock(
        '../list-item-delete-alert.svelte',
        async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
      );
      vi.doMock(
        '../menu.svelte',
        async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
      );
      vi.doMock('$lib/store/list', () => ({ list: writable(null) }));
      vi.mocked(
        fetch,
      ).mockResolvedValue({
        json: vi.fn(() => [{ id: 1 }, { id: 2 }, { id: 3 }]),
      });
      render(await import('../+page.svelte').then((module) => module.default));
      const skeletons = await screen.findAllByText('List item mock');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
