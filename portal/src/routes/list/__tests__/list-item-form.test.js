// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';
import ListItemForm from '../list-item-form.svelte';

vi.stubGlobal('fetch', vi.fn(() => ({ ok: true })));
vi.mock('@tmible/wishlist-common/array-to-ordered-json');
vi.mock('$lib/tiptap-to-telegram.js');
vi.mock(
  '$lib/store/list',
  () => ({
    list: writable([{
      id: 'id',
      description: 'description',
      descriptionEntities: [{ offset: 0, type: 0 }],
      category: { id: null },
      property1: 'stored1',
      property2: 'stored2',
    }]),
  }),
);
vi.mock('$lib/store/categories.js', () => ({ categories: writable([]) }));
vi.mock(
  '$lib/components/text-editor',
  async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
);

describe('list item form', () => {
  // let dispatchSpies;

  // beforeAll(() => {
  //   dispatchSpies = [];
  //   vi.doMock(
  //     'svelte',
  //     async (importOriginal) => {
  //       const original = await importOriginal();
  //       return {
  //         ...original,
  //         createEventDispatcher: () => {
  //           const spy = vi.fn(original.createEventDispatcher());
  //           dispatchSpies.push(spy);
  //           return spy;
  //         },
  //       };
  //     },
  //   );
  // });

  afterEach(() => {
    // dispatchSpies = [];
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed with empty inputs', () => {
    const { container } = render(ListItemForm);

    // remove random ids to match snapshot
    const select = screen.getByRole('combobox');
    select.removeAttribute('id');
    select.removeAttribute('aria-controls');
    select.removeAttribute('aria-labelledby');
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should prefill inputs', () => {
    const { container } = render(
      ListItemForm,
      {
        values: {
          name: 'name',
          description: 'description',
          category: { id: 'categoryId', name: 'categoryName' },
        },
      },
    );
    expect(Array.from(container.querySelectorAll('input'), ({ value }) => value)).toMatchSnapshot();
  });

  // it('should dispatch cancel event on cancel button click', async () => {
  //   const user = userEvent.setup();
  //   render(ListItemForm);
  //   await user.click(screen.getByText('Отмена', { selector: 'button' }));
  //   expect(dispatchSpies[0]).toHaveBeenCalledWith('cancel');
  // });

  describe('on submit button click', () => {
    let component;
    let form;
    let formData;

    beforeEach(() => {
      formData = {
        get: vi.fn(() => JSON.stringify({ content: 'content' })),
        set: vi.fn(),
        append: vi.fn(),
        delete: vi.fn(),
        entries: vi.fn(() => []),
      };
      vi.spyOn(Object, 'fromEntries').mockReturnValue({});
      vi.stubGlobal('FormData', vi.fn(() => formData));
      vi.mocked(tiptapToTelegram).mockReturnValue([]);
      let baseElement;
      ({ baseElement, component } = render(ListItemForm));
      form = baseElement.querySelector('form');
    });

    it('should call tiptapToTelegram', () => {
      fireEvent.submit(form);
      expect(tiptapToTelegram).toHaveBeenCalledWith('content');
    });

    it('should set description', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      fireEvent.submit(form);
      expect(formData.set).toHaveBeenCalledWith('description', 'description');
    });

    it('should set description entities', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      fireEvent.submit(form);
      expect(
        formData.set,
      ).toHaveBeenCalledWith(
        'descriptionEntities',
        JSON.stringify([ 'entity 1', 'entity 2' ]),
      );
    });

    describe('if was prefilled', () => {
      beforeEach(() => {
        component.$set({ values: { id: 'id', category: { id: null } } });
        formData.entries.mockReturnValueOnce([
          [ 'property1', 'stored1' ],
          [ 'property2', 'fromForm2' ],
          [ 'descriptionEntities', '[{"type":0,"offset":0}]' ],
          [ 'categoryId', 'null' ],
        ]);
        vi.mocked(arrayToOrderedJSON).mockReturnValue('[]');
      });

      it('should filter values', () => {
        fireEvent.submit(form);
        expect(formData.delete).toHaveBeenCalledWith('property1');
      });

      it('should filter description entities', () => {
        fireEvent.submit(form);
        expect(formData.delete).toHaveBeenCalledWith('descriptionEntities');
      });

      it('should filter category', () => {
        fireEvent.submit(form);
        expect(formData.delete).toHaveBeenCalledWith('categoryId');
      });

      // it('should dispatch cancel event if no values left after filter', () => {
      //   tiptapToTelegram.mockReturnValueOnce([ 'description', []]);
      //   fireEvent.submit(form);
      //   expect(dispatchSpies[0]).toHaveBeenCalledWith('cancel');
      // });

      it('should send form via "PATCH"', () => {
        formData.entries.mockReturnValueOnce([
          [ 'property1', 'stored1' ],
          [ 'property2', 'fromForm2' ],
        ]);
        vi.spyOn(Object, 'fromEntries').mockReturnValue({ from: 'entries' });
        fireEvent.submit(form);
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          '/api/wishlist/id',
          {
            method: 'PATCH',
            body: JSON.stringify({ from: 'entries' }),
          },
        );
      });
    });

    it('should append order if was not prefilled', () => {
      fireEvent.submit(form);
      expect(formData.append).toHaveBeenCalledWith('order', 1);
    });

    it('should send form via "POST"', () => {
      vi.spyOn(Object, 'fromEntries').mockReturnValueOnce({ from: 'entries' });
      fireEvent.submit(form);
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/wishlist',
        {
          method: 'POST',
          body: JSON.stringify({ from: 'entries' }),
        },
      );
    });

    // it('should dispatch success event on form success', async () => {
    //   fireEvent.submit(form);
    //   await waitFor(() => expect(dispatchSpies[0]).toHaveBeenCalledWith('success'));
    // });
  });
});
