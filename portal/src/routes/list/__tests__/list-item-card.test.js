// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ListItemCard from '../list-item-card.svelte';

vi.mock(
  '$lib/components/telegram-entities/parser.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock(
  '../list-item-form.svelte',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);

describe('list item card', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed as skeleton', () => {
    const { container } = render(ListItemCard, { isSkeleton: true });
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should be displayed default', () => {
    const { container } = render(
      ListItemCard,
      { listItem: { name: 'name', category: { id: 0, name: 'category' } } },
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should be displayed for reordering', () => {
    const { container } = render(
      ListItemCard,
      { listItem: { name: 'name' }, isReorderModeOn: true },
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should enable editing mode', async () => {
    const { container } = render(
      ListItemCard,
      { listItem: { name: 'name', category: { id: 0, name: 'category' } } },
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Редактировать/, { selector: 'button' }));
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should request item deletion', async () => {
    const ondelete = vi.fn();
    const listItem = { id: 'id', name: 'name', category: { id: 0, name: 'category' } };
    render(
      ListItemCard,
      { listItem, ondelete },
    );
    const user = userEvent.setup();
    await user.click(screen.getByText(/Удалить/, { selector: 'button' }));
    expect(ondelete).toHaveBeenCalledWith(listItem);
  });
});
