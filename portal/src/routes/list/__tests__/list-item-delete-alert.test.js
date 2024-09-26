// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListItemDeleteAlert from '../list-item-delete-alert.svelte';

describe('list item delete alert', () => {
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

  it('should be displayed closed', () => {
    const { baseElement } = render(
      ListItemDeleteAlert,
      { open: false, listItemToDelete: { id: 'id', name: 'name' } },
    );
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    let baseElement;

    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
      ({ baseElement } = render(
        ListItemDeleteAlert,
        { open: true, listItemToDelete: { id: 'id', name: 'name' } },
      ));
    });

    it('should be displayed', () => {
      // remove random ids to match snapshot
      const alertDialog = screen.getByRole('alertdialog');
      alertDialog.removeAttribute('id');
      const titleId = alertDialog.getAttribute('aria-describedby');
      alertDialog.removeAttribute('aria-describedby');
      const descriptionId = alertDialog.getAttribute('aria-labelledby');
      alertDialog.removeAttribute('aria-labelledby');
      baseElement.querySelector(`[id="${titleId}"]`).removeAttribute('id');
      baseElement.querySelector(`[id="${descriptionId}"]`).removeAttribute('id');
      expect(baseElement).toMatchSnapshot();
    });

    describe('on cancel button click', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.click(screen.getByText('Отмена', { selector: 'button' }));
      });

      it('should close', () => {
        expect(baseElement).toMatchSnapshot();
      });

      it('should not request deletion', () => {
        expect(vi.mocked(fetch)).not.toHaveBeenCalled();
      });

      // it('should not dispatch event', () => {
      //   expect(dispatchSpies[0]).not.toHaveBeenCalled();
      // });
    });

    describe('on confirm button click', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.click(screen.getByText('Удалить', { selector: 'button' }));
      });

      it('should close', () => {
        expect(baseElement).toMatchSnapshot();
      });

      it('should request deletion', () => {
        expect(
          vi.mocked(fetch),
        ).toHaveBeenCalledWith(
          '/api/wishlist',
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify([ 'id' ]),
          },
        );
      });

      // it('should dispatch event', () => {
      //   expect(dispatchSpies[0]).toHaveBeenCalledWith('delete');
      // });
    });
  });
});
