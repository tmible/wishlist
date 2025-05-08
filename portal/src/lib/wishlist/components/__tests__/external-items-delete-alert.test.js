// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteItems } from '../../use-cases/delete-items.js';
import ExternalItemsDeleteAlert from '../external-items-delete-alert.svelte';

vi.mock(
  '../../store.js',
  () => ({ wishlist: writable([{ isExternal: 0, id: 1 }, { isExternal: 1, id: 2 }]) }),
);
vi.mock('../../use-cases/delete-items.js');

describe('wishlist / components / external items delete alert', () => {
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
    const { baseElement } = render(ExternalItemsDeleteAlert, { open: false });
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    let baseElement;

    beforeEach(() => {
      ({ baseElement } = render(ExternalItemsDeleteAlert, { open: true }));
    });

    it('should be displayed', () => {
      expect(baseElement).toMatchSnapshot();
    });

    it('should close on cancel button click', async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText('Отмена', { selector: 'button' }));
      expect(baseElement).toMatchSnapshot();
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
        expect(vi.mocked(deleteItems)).toHaveBeenCalledWith([ 2 ]);
      });
    });
  });
});
