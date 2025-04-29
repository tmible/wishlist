// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { getContext } from 'svelte';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { wishlist } from '$lib/wishlist/store.js';
import List from '../+page.svelte';

vi.mock('sortablejs');
vi.mock(
  'svelte',
  async (importOriginal) => {
    const original = await importOriginal();
    return { ...original, getContext: vi.fn(original.getContext) };
  },
);
vi.mock(
  '$lib/categories/dialog.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '$lib/components/header.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '$lib/components/modal-portal.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock('$lib/wishlist/store.js', () => ({ wishlist: writable([]) }));
vi.mock(
  '$lib/wishlist/components/item-add-dialog.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '$lib/wishlist/components/item-card.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '$lib/wishlist/components/item-delete-alert.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../menu.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);

describe('list page', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed', () => {
    const { container } = render(List);
    expect(container.innerHTML.trim()).not.toBe('');
  });

  it('should get get wishlist promise from context', () => {
    render(List);
    expect(vi.mocked(getContext)).toHaveBeenCalledWith('get wishlist promise');
  });

  it('should display skeletons while list is requested', () => {
    vi.mocked(
      getContext,
    ).mockReturnValueOnce(
      async () => {
        const skeletons = await screen.findAllByText('Skeleton mock');
        expect(skeletons.length).toBeGreaterThan(0);
      },
    );
    render(List);
  });

  it('should display empty list message', async () => {
    render(List);
    expect(await screen.findByText('Ваш список пуст')).toBeDefined();
  });

  it('should display list', async () => {
    vi.mocked(wishlist).set([{ id: 1 }, { id: 2 }, { id: 3 }]);
    render(List);
    const skeletons = await screen.findAllByText('Item mock');
    vi.mocked(wishlist).set([]);
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
