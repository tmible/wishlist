// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { categories } from '$lib/categories/store.js';
import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';
import { addItem } from '../../use-cases/add-item.js';
import { editItem } from '../../use-cases/edit-item.js';
import ItemForm from '../item-form.svelte';

let categorySelectValue = null;

vi.mock('$lib/categories/store.js', () => ({ categories: writable([]) }));
vi.mock(
  '$lib/components/text-editor',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);
vi.mock('$lib/tiptap-to-telegram.js');
vi.mock('../../use-cases/add-item.js');
vi.mock('../../use-cases/edit-item.js');
vi.mock(
  '$lib/categories/select.svelte',
  () => ({ default: (_, props) => categorySelectValue = props.selectedCategoryId }),
);

describe('wishlist / components / item form', () => {
  afterEach(() => {
    categorySelectValue = null;
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed with empty inputs', () => {
    const { container } = render(ItemForm);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should prefill inputs', () => {
    vi.mocked(categories).set([{ id: 'categoryId', name: 'categoryName' }]);
    const { container } = render(
      ItemForm,
      {
        values: {
          name: 'name',
          description: 'description',
          category: { id: 'categoryId', name: 'categoryName' },
        },
      },
    );
    vi.mocked(categories).set([]);
    expect(Array.from(container.querySelectorAll('input'), ({ value }) => value)).toMatchSnapshot();
    expect(categorySelectValue).toBe('categoryId');
  });

  it('should dispatch finish event on cancel button click', async () => {
    const onfinish = vi.fn();
    const user = userEvent.setup();
    render(ItemForm, { onfinish });
    await user.click(screen.getByText('Отмена', { selector: 'button' }));
    expect(onfinish).toHaveBeenCalled();
  });

  describe('on submit button click', () => {
    const props = $state({
      onfinish: vi.fn(),
    });

    let form;

    beforeEach(() => {
      vi.spyOn(
        Object,
        'fromEntries',
      ).mockReturnValue({
        categoryId: '',
        description: JSON.stringify({ content: 'content' }),
      });
      vi.mocked(tiptapToTelegram).mockReturnValue([]);
      const { baseElement } = render(ItemForm, props);
      form = baseElement.querySelector('form');
    });

    it('should call tiptapToTelegram', () => {
      fireEvent.submit(form);
      expect(tiptapToTelegram).toHaveBeenCalledWith('content');
    });

    it('should edit item', () => {
      props.values = { name: 'name' };
      props.item = { id: 'id' };
      fireEvent.submit(form);
      delete props.values;
      delete props.item;
      expect(vi.mocked(editItem)).toHaveBeenCalledWith({ id: 'id' }, expect.any(Object));
    });

    it('should add item', () => {
      fireEvent.submit(form);
      expect(vi.mocked(addItem)).toHaveBeenCalled();
    });

    it('should dispatch finish event', async () => {
      fireEvent.submit(form);
      await vi.waitFor(() => expect(props.onfinish).toHaveBeenCalled());
    });

    it('should set description', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      fireEvent.submit(form);
      expect(
        vi.mocked(addItem),
      ).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'description' }),
      );
    });

    it('should set description entities', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      fireEvent.submit(form);
      expect(
        vi.mocked(addItem),
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          descriptionEntities: [ 'entity 1', 'entity 2' ],
        }),
      );
    });

    describe('category', () => {
      describe('if there is no category id', () => {
        it('should set category to null', () => {
          fireEvent.submit(form);
          expect(
            vi.mocked(addItem),
          ).toHaveBeenCalledWith(
            expect.objectContaining({ category: null }),
          );
        });

        it('should delete categoryId', () => {
          fireEvent.submit(form);
          expect(
            vi.mocked(addItem),
          ).toHaveBeenCalledWith(
            expect.not.objectContaining({ categoryId: expect.anything() }),
          );
        });
      });

      describe('if there is category id', () => {
        beforeEach(() => {
          vi.mocked(
            Object.fromEntries,
          ).mockReturnValueOnce({
            categoryId: '123',
            description: JSON.stringify({ content: 'content' }),
          });
        });

        it('should set category from store if there is such', () => {
          vi.mocked(categories).set([{ id: 123, name: 'name 123' }]);
          fireEvent.submit(form);
          vi.mocked(categories).set([]);
          expect(
            vi.mocked(addItem),
          ).toHaveBeenCalledWith(
            expect.objectContaining({ category: { id: 123, name: 'name 123' } }),
          );
        });

        it('should set category to null if there is no such in store', () => {
          fireEvent.submit(form);
          expect(
            vi.mocked(addItem),
          ).toHaveBeenCalledWith(
            expect.objectContaining({ category: null }),
          );
        });

        it('should delete categoryId', () => {
          fireEvent.submit(form);
          expect(
            vi.mocked(addItem),
          ).toHaveBeenCalledWith(
            expect.not.objectContaining({ categoryId: expect.anything() }),
          );
        });
      });
    });
  });
});
