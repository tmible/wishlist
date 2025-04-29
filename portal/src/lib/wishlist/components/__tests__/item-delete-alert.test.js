// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteItem } from '../../use-cases/delete-item.js';
import ItemDeleteAlert from '../item-delete-alert.svelte';

vi.mock('../../use-cases/delete-item.js');

describe('wishlist / components / item delete alert', () => {
  let modalPortal;

  beforeEach(() => {
    modalPortal = document.createElement('div');
    modalPortal.id = 'modal-portal';
    document.body.append(modalPortal);
  });

  afterEach(() => {
    modalPortal.remove();
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed closed', () => {
    const { baseElement } = render(
      ItemDeleteAlert,
      { open: false, listItemToDelete: { id: 'id', name: 'name' } },
    );
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    let baseElement;

    beforeEach(() => {
      ({ baseElement } = render(
        ItemDeleteAlert,
        { open: true, listItemToDelete: { id: 'id', name: 'name' } },
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
        expect(vi.mocked(deleteItem)).not.toHaveBeenCalled();
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
        expect(vi.mocked(deleteItem)).toHaveBeenCalledWith({ id: 'id', name: 'name' });
      });
    });
  });
});
