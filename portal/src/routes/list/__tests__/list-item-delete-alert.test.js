// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListItemDeleteAlert from '../list-item-delete-alert.svelte';

describe('list item delete alert', () => {
  afterEach(() => {
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
    const ondelete = vi.fn();

    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
      ({ baseElement } = render(
        ListItemDeleteAlert,
        { open: true, listItemToDelete: { id: 'id', name: 'name' }, ondelete },
      ));
    });

    it('should be displayed', () => {
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

      it('should not dispatch event', () => {
        expect(ondelete).not.toHaveBeenCalled();
      });
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

      it('should dispatch event', () => {
        expect(ondelete).toHaveBeenCalled();
      });
    });
  });
});
