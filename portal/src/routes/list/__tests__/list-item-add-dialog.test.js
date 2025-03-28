// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ListItemAddDialog from '../list-item-add-dialog.svelte';

let formMock = null;

vi.mock('../list-item-form.svelte', () => ({ default: (_, props) => formMock = props }));

describe('list item add dialog', () => {
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
    const { baseElement } = render(ListItemAddDialog, { open: false });
    expect(baseElement).toMatchSnapshot();
  });

  describe('opened', () => {
    let baseElement;
    const add = vi.fn();

    beforeEach(() => {
      vi.useFakeTimers();
      ({ baseElement } = render(ListItemAddDialog, { open: true, add }));
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

    describe('on form cancel', () => {
      beforeEach(() => {
        formMock.cancel();
      });

      it('should close', () => {
        expect(baseElement).toMatchSnapshot();
      });

      it('should not dispatch event', () => {
        expect(add).not.toHaveBeenCalled();
      });
    });

    describe('on form success', () => {
      beforeEach(() => {
        formMock.success();
      });

      it('should close', () => {
        expect(baseElement).toMatchSnapshot();
      });

      it('should dispatch event', () => {
        expect(add).toHaveBeenCalled();
      });
    });
  });
});
