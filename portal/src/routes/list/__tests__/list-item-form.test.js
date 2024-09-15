// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import arrayToOrderedJSON from '@tmible/wishlist-common/array-to-ordered-json';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';

const dispatch = vi.fn();

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
      property1: 'stored1',
      property2: 'stored2',
    }]),
  }),
);
vi.mock('$lib/store/user', () => ({ user: writable({ id: 'userid' }) }));

describe('list item form', () => {
  let ListItemForm;

  beforeEach(async () => {
    vi.doMock('svelte');
    vi.mocked(
      await import('svelte').then(({ createEventDispatcher }) => createEventDispatcher),
    ).mockReturnValue(dispatch);
    vi.doMock(
      '$lib/components/text-editor',
      async () => ({ default: await import('./mock.svelte').then((module) => module.default) }),
    );
    ListItemForm = await import('../list-item-form.svelte').then((module) => module.default);
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed with empty inputs', () => {
    const { container } = render(ListItemForm);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should prefill inputs', () => {
    render(
      ListItemForm,
      {
        values: {
          name: 'name',
          description: 'description',
          priority: 10,
        },
      },
    );
    expect([
      ...screen.getAllByRole('textbox'),
      ...screen.getAllByRole('spinbutton'),
    ].map(({ value }) => value)).toMatchSnapshot();
  });

  it('should dispatch cancel event on cancel button click', async () => {
    const user = userEvent.setup();
    render(ListItemForm);
    await user.click(screen.getByText('Отмена', { selector: 'button' }));
    expect(dispatch).toHaveBeenCalledWith('cancel');
  });

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
        component.$set({ values: { id: 'id' } });
        formData.entries.mockReturnValueOnce([
          [ 'property1', 'stored1' ],
          [ 'property2', 'fromForm2' ],
          [ 'descriptionEntities', '[{"type":0,"offset":0}]' ],
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

      it('should dispatch cancel event if no values left after filter', () => {
        tiptapToTelegram.mockReturnValueOnce([ 'description', []]);
        fireEvent.submit(form);
        expect(dispatch).toHaveBeenCalledWith('cancel');
      });

      it('should send form via "PUT"', () => {
        formData.entries.mockReturnValueOnce([
          [ 'property1', 'stored1' ],
          [ 'property2', 'fromForm2' ],
        ]);
        vi.spyOn(Object, 'fromEntries').mockReturnValue({ from: 'entries' });
        fireEvent.submit(form);
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          '/api/wishlist/id',
          {
            method: 'PUT',
            body: JSON.stringify({ from: 'entries' }),
          },
        );
      });
    });

    it('should append userid', () => {
      fireEvent.submit(form);
      expect(formData.append).toHaveBeenCalledWith('userid', 'userid');
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

    it('should dispatch success event on form success', async () => {
      fireEvent.submit(form);
      await waitFor(() => expect(dispatch).toHaveBeenCalledWith('success'));
    });
  });
});
