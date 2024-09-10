// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enhance } from '$app/forms';
import { tiptapToTelegram } from '$lib/tiptap-to-telegram.js';

const dispatch = vi.fn();

vi.mock('$app/forms');
vi.mock('$lib/tiptap-to-telegram.js');
vi.mock(
  '$lib/store/list',
  () => ({
    list: writable([{
      id: 'id',
      description: 'description',
      descriptionEntities: [],
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
    const { container } = render(ListItemForm, { form: undefined });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should prefill inputs', () => {
    render(
      ListItemForm,
      {
        form: undefined,
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
    render(ListItemForm, { form: undefined });
    await user.click(screen.getByText('Отмена', { selector: 'button' }));
    expect(dispatch).toHaveBeenCalledWith('cancel');
  });

  describe('on submit button click', () => {
    let formSubmitHandler;
    const cancel = vi.fn();
    let formData;
    let component;

    beforeEach(async () => {
      formData = new FormData();
      formData.set('description', JSON.stringify({ content: 'content' }));
      vi.mocked(enhance).mockImplementation((form, handler) => formSubmitHandler = handler);
      vi.mocked(tiptapToTelegram).mockReturnValue([]);
      const user = userEvent.setup();
      ({ component } = render(ListItemForm, { form: undefined }));
      await user.click(
        screen.getByText(/^(?:Сохранить|Добавить)$/, { selector: 'button[type="submit"]' }),
      );
    });

    it('should call tiptapToTelegram', () => {
      formSubmitHandler({ cancel, formData });
      expect(tiptapToTelegram).toHaveBeenCalledWith('content');
    });

    it('should set description', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      formSubmitHandler({ cancel, formData });
      expect(formData.get('description')).toBe('description');
    });

    it('should set description entities', () => {
      tiptapToTelegram.mockReturnValueOnce([ 'description', [ 'entity 1', 'entity 2' ]]);
      formSubmitHandler({ cancel, formData });
      expect(formData.get('descriptionEntities')).toBe(JSON.stringify([ 'entity 1', 'entity 2' ]));
    });

    describe('if was prefilled', () => {
      beforeEach(() => {
        component.$set({ values: { id: 'id' } });
        formData.set('property1', 'stored1');
        formData.set('property2', 'fromForm2');
      });

      it('should filter values', () => {
        formSubmitHandler({ cancel, formData });
        expect(formData.has('property1')).toBe(false);
      });

      describe('if no values left after filter', () => {
        beforeEach(() => {
          component.$set({ values: { id: 'id' } });
          tiptapToTelegram.mockReturnValueOnce([ 'description', []]);
          formData.set('property1', 'stored1');
          formData.set('property2', 'stored2');
          formSubmitHandler({ cancel, formData });
        });

        it('should cancel request', () => {
          expect(cancel).toHaveBeenCalled();
        });

        it('should dispatch cancel event', () => {
          expect(dispatch).toHaveBeenCalledWith('cancel');
        });
      });

      it('should append listItemId', () => {
        formSubmitHandler({ cancel, formData });
        expect(formData.get('listItemId')).toBe('id');
      });

      it('should append method', () => {
        formSubmitHandler({ cancel, formData });
        expect(formData.get('method')).toBe('PUT');
      });
    });

    it('should append userid', () => {
      formSubmitHandler({ cancel, formData });
      expect(formData.get('userid')).toBe('userid');
    });

    it('should append method', () => {
      formSubmitHandler({ cancel, formData });
      expect(formData.get('method')).toBe('POST');
    });
  });

  it('should dispatch success event on form success', () => {
    render(ListItemForm, { form: { success: true } });
    expect(dispatch).toHaveBeenCalledWith('success');
  });
});
