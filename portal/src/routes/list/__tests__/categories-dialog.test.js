// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { categories } from '$lib/store/categories.js';
import CategoriesDialog from '../categories-dialog.svelte';

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({ json: vi.fn(() => [{ id: 3, name: 'category 3' }]) }),
);
vi.mock(
  '$lib/store/categories.js',
  () => ({ categories: writable([{ id: 1, name: 'category 1' }, { id: 2, name: 'category 2' }]) }),
);

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
    const { baseElement } = render(CategoriesDialog, { open: true });
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    beforeEach(() => {
      render(CategoriesDialog, { open: true });
    });

    it('should set button disabled if input is empty', () => {
      const button = screen.getByText(/Добавить/, { selector: 'button' });
      expect(button.getAttribute('disabled')).toBe('');
    });

    describe('add new category', () => {
      beforeEach(async () => {
        vi.spyOn(vi.mocked(categories), 'set').mockImplementation(vi.fn());
        const input = screen.getByPlaceholderText(/Новая категория/);
        await act(() => fireEvent.input(input, { target: { value: 'new category' } }));
        const button = screen.getByText(/Добавить/, { selector: 'button' });
        await user.click(button);
      });

      it('should post new category', () => {
        expect(
          vi.mocked(fetch),
        ).toHaveBeenCalledWith(
          '/api/wishlist/categories',
          { method: 'POST', body: 'new category' },
        );
      });

      it('should refresh categories', () => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/categories');
      });

      it('should set refreshed categories into store', async () => {
        await waitFor(
          () => expect(
            vi.mocked(categories.set),
          ).toHaveBeenCalledWith(
            [{ id: 3, name: 'category 3' }],
          ),
        );
      });
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
            vi.spyOn(vi.mocked(categories), 'set').mockImplementation(vi.fn());
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

          it('should put category', () => {
            expect(
              vi.mocked(fetch),
            ).toHaveBeenCalledWith(
              '/api/wishlist/categories/1',
              { method: 'PUT', body: 'category 1 new' },
            );
          });

          it('should refresh categories', () => {
            expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/categories');
          });

          it('should set refreshed categories into store', async () => {
            await waitFor(
              () => expect(
                vi.mocked(categories.set),
              ).toHaveBeenCalledWith(
                [{ id: 3, name: 'category 3' }],
              ),
            );
          });
        });
      });
    });

    describe('delete category', () => {
      beforeEach(async () => {
        vi.spyOn(vi.mocked(categories), 'set').mockImplementation(vi.fn());
        await user.click(screen.getAllByTestId(/delete-button/, { selector: 'button' })[0]);
      });

      it('should delete category', () => {
        expect(
          vi.mocked(fetch),
        ).toHaveBeenCalledWith(
          '/api/wishlist/categories/1',
          { method: 'DELETE' },
        );
      });

      it('should refresh categories', () => {
        expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/wishlist/categories');
      });

      it('should set refreshed categories into store', async () => {
        await waitFor(
          () => expect(
            vi.mocked(categories.set),
          ).toHaveBeenCalledWith(
            [{ id: 3, name: 'category 3' }],
          ),
        );
      });
    });
  });
});
