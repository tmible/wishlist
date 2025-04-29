// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CategoriesDialog from '../dialog.svelte';
import { createCategory } from '../use-cases/create-category.js';
import { deleteCategory } from '../use-cases/delete-category.js';
import { editCategory } from '../use-cases/edit-category.js';

vi.mock(
  '../store.js',
  () => ({ categories: writable([{ id: 1, name: 'category 1' }, { id: 2, name: 'category 2' }]) }),
);
vi.mock('../use-cases/create-category.js');
vi.mock('../use-cases/delete-category.js');
vi.mock('../use-cases/edit-category.js');

describe('categories dialog', () => {
  let user;
  let modalPortal;

  beforeEach(() => {
    modalPortal = document.createElement('div');
    modalPortal.id = 'modal-portal';
    document.body.append(modalPortal);
    user = userEvent.setup();
  });

  afterEach(() => {
    modalPortal.remove();
    vi.clearAllMocks();
    cleanup();
  });

  it('should be rendered closed', () => {
    expect(render(CategoriesDialog).baseElement).toMatchSnapshot();
  });

  it('should be rendered opened', () => {
    vi.useFakeTimers();
    const { baseElement } = render(CategoriesDialog, { open: true });
    vi.runAllTimers();
    vi.useRealTimers();
    expect(baseElement).toMatchSnapshot();
  });

  it('should focus itself', () => {
    vi.useFakeTimers();
    render(CategoriesDialog, { open: true });
    const dialog = screen.getByRole('dialog');
    vi.spyOn(dialog, 'focus');
    vi.runAllTimers();
    vi.useRealTimers();
    expect(vi.mocked(dialog.focus)).toHaveBeenCalled();
  });

  describe('opened', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      render(CategoriesDialog, { open: true });
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should set button disabled if input is empty', () => {
      const button = screen.getByText(/Добавить/, { selector: 'button' });
      expect(button.getAttribute('disabled')).toBe('');
    });

    it('should add new category', async () => {
      const input = screen.getByPlaceholderText(/Новая категория/);
      await act(() => fireEvent.input(input, { target: { value: 'new category' } }));
      const button = screen.getByText(/Добавить/, { selector: 'button' });
      await user.click(button);
      expect(vi.mocked(createCategory)).toHaveBeenCalledWith({ name: 'new category' });
    });

    describe('edit category', () => {
      beforeEach(async () => {
        await user.click(screen.getAllByTestId(/edit-button/, { selector: 'button' })[0]);
      });

      it('should display input', () => {
        expect(screen.getByPlaceholderText('category 1')).toBeDefined();
      });

      it('should focus input', () => {
        expect(screen.getByPlaceholderText('category 1')).toBe(document.activeElement);
      });

      it('should hide edit button', () => {
        expect(screen.getAllByTestId(/edit-button/, { selector: 'button' }).length).toBe(1);
      });

      it('should hide delete button', () => {
        expect(screen.getAllByTestId(/delete-button/, { selector: 'button' }).length).toBe(1);
      });

      it('should display cancel button', () => {
        expect(screen.getAllByTestId(/cancel-button/, { selector: 'button' }).length).toBe(1);
      });

      it('should display submit button', () => {
        expect(screen.getAllByTestId(/submit-button/, { selector: 'button' }).length).toBe(1);
      });

      describe('on cancel', () => {
        beforeEach(async () => {
          await user.click(screen.getByTestId(/cancel-button/, { selector: 'button' }));
        });

        it('should hide input', () => {
          expect(screen.queryByPlaceholderText('category 1')).toBeNull();
        });

        it('should display edit button', () => {
          expect(screen.queryAllByTestId(/edit-button/, { selector: 'button' }).length).toBe(2);
        });

        it('should display delete button', () => {
          expect(screen.queryAllByTestId(/delete-button/, { selector: 'button' }).length).toBe(2);
        });

        it('should hide cancel button', () => {
          expect(screen.queryAllByTestId(/cancel-button/, { selector: 'button' }).length).toBe(0);
        });

        it('should hide submit button', () => {
          expect(screen.queryAllByTestId(/submit-button/, { selector: 'button' }).length).toBe(0);
        });
      });

      describe('on submit', () => {
        describe('if unchanged', () => {
          beforeEach(async () => {
            await user.click(screen.getByTestId(/submit-button/, { selector: 'button' }));
          });

          it('should hide input', () => {
            expect(screen.queryByPlaceholderText('category 1')).toBeNull();
          });

          it('should display edit button', () => {
            expect(screen.queryAllByTestId(/edit-button/, { selector: 'button' }).length).toBe(2);
          });

          it('should display delete button', () => {
            expect(screen.queryAllByTestId(/delete-button/, { selector: 'button' }).length).toBe(2);
          });

          it('should hide cancel button', () => {
            expect(screen.queryAllByTestId(/cancel-button/, { selector: 'button' }).length).toBe(0);
          });

          it('should hide submit button', () => {
            expect(screen.queryAllByTestId(/submit-button/, { selector: 'button' }).length).toBe(0);
          });
        });

        describe('if changed', () => {
          beforeEach(async () => {
            await act(() => fireEvent.input(
              screen.getByDisplayValue('category 1'),
              { target: { value: 'category 1 new' } },
            ));
            await user.click(screen.getByTestId(/submit-button/, { selector: 'button' }));
          });

          it('should hide input', () => {
            expect(screen.queryByPlaceholderText('category 1')).toBeNull();
          });

          it('should display edit button', () => {
            expect(screen.queryAllByTestId(/edit-button/, { selector: 'button' }).length).toBe(2);
          });

          it('should display delete button', () => {
            expect(screen.queryAllByTestId(/delete-button/, { selector: 'button' }).length).toBe(2);
          });

          it('should hide cancel button', () => {
            expect(screen.queryAllByTestId(/cancel-button/, { selector: 'button' }).length).toBe(0);
          });

          it('should hide submit button', () => {
            expect(screen.queryAllByTestId(/submit-button/, { selector: 'button' }).length).toBe(0);
          });

          it('should edit category', () => {
            expect(
              vi.mocked(editCategory),
            ).toHaveBeenCalledWith(
              { id: 1, name: 'category 1' },
              { id: 1, name: 'category 1 new' },
            );
          });
        });
      });
    });

    it('should delete category', async () => {
      await user.click(screen.getAllByTestId(/delete-button/, { selector: 'button' })[0]);
      expect(vi.mocked(deleteCategory)).toHaveBeenCalledWith({ id: 1, name: 'category 1' });
    });
  });
});
