// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ItemAddDialog from '../item-add-dialog.svelte';

let formMock = null;

vi.mock('../item-form.svelte', () => ({ default: (_, props) => formMock = props }));

describe('wishlist / components / item add dialog', () => {
  let modalPortal;

  beforeEach(() => {
    modalPortal = document.createElement('div');
    modalPortal.id = 'modal-portal';
    document.body.append(modalPortal);
  });

  afterEach(() => {
    formMock = null;
    modalPortal.remove();
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed closed', () => {
    const { baseElement } = render(ItemAddDialog, { open: false });
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    let baseElement;

    beforeEach(() => {
      vi.useFakeTimers();
      ({ baseElement } = render(ItemAddDialog, { open: true }));
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should be displayed', () => {
      expect(baseElement).toMatchSnapshot();
    });

    it('should focus itself', () => {
      const dialog = screen.getByRole('dialog');
      vi.spyOn(dialog, 'focus');
      vi.runAllTimers();
      expect(vi.mocked(dialog.focus)).toHaveBeenCalled();
    });

    it('should close on form finish', () => {
      formMock.onfinish();
      expect(baseElement).toMatchSnapshot();
    });
  });
});
