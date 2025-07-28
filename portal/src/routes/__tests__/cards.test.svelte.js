// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForElement } from '$lib/wait-for-element.js';
import Cards from '../cards.svelte';

vi.mock('$lib/wait-for-element.js');

describe('cards', () => {
  const mockElement = document.createElement('div');

  let props = $state();
  let baseElement;

  beforeEach(() => {
    vi.mocked(waitForElement).mockResolvedValue(mockElement);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('if visible', () => {
    beforeEach(() => {
      props = { isVisible: true };
      ({ baseElement } = render(Cards, props));
    });

    it('should wait for telegram login widget on beforeUpdateHandler', () => {
      expect(
        vi.mocked(waitForElement),
      ).toHaveBeenCalledWith(
        '[id="telegram-login-wishnibot"]',
        [ document.head, expect.any(HTMLElement) ],
      );
    });

    it('should add title to telegram login widget', async () => {
      const titleSetter = vi.spyOn(mockElement, 'title', 'set');
      props.isVisible = false;
      props.isVisible = true;
      await vi.waitFor(() => expect(titleSetter).toHaveBeenCalledWith(expect.any(String)));
    });

    it('should replace telegram login widget on beforeUpdateHandler', async () => {
      const [ telegramloginWidgetContainer ] = baseElement.querySelectorAll('.card-body');
      vi.spyOn(telegramloginWidgetContainer, 'append');
      props.isVisible = false;
      props.isVisible = true;
      await vi.waitFor(
        () => expect(telegramloginWidgetContainer.append).toHaveBeenCalledWith(mockElement),
      );
    });
  });

  describe('if not visible', () => {
    beforeEach(() => {
      props = { isVisible: false };
      ({ baseElement } = render(Cards, props));
    });

    it('should not wait for telegram login widget on beforeUpdateHandler', () => {
      expect(vi.mocked(waitForElement)).not.toHaveBeenCalled();
    });

    it('should not add title to telegram login widget', async () => {
      const titleSetter = vi.spyOn(mockElement, 'title', 'set');
      props.isVisible = true;
      props.isVisible = false;
      await vi.waitFor(() => expect(titleSetter).not.toHaveBeenCalled());
    });

    it('should not replace telegram login widget on beforeUpdateHandler', async () => {
      const [ telegramloginWidgetContainer ] = baseElement.querySelectorAll('.card-body');
      vi.spyOn(telegramloginWidgetContainer, 'append');
      props.isVisible = true;
      props.isVisible = false;
      await vi.waitFor(() => expect(telegramloginWidgetContainer.append).not.toHaveBeenCalled());
    });
  });
});
