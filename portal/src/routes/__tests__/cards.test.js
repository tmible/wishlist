// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { beforeUpdate } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForElement } from '$lib/wait-for-element.js';
import Cards from '../cards.svelte';

vi.mock('$lib/wait-for-element.js');
vi.mock('svelte');

describe('cards', () => {
  let baseElement;
  let beforeUpdateHandler;
  const mockElement = document.createElement('div');

  beforeEach(() => {
    vi.mocked(beforeUpdate).mockImplementation((...args) => [ beforeUpdateHandler ] = args);
    vi.mocked(waitForElement).mockResolvedValue(mockElement);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('if visible', () => {
    beforeEach(() => {
      ({ baseElement } = render(Cards, { isVisible: true }));
    });

    it('should wait for telegram login widget on beforeUpdateHandler', async () => {
      await beforeUpdateHandler();
      expect(
        vi.mocked(waitForElement),
      ).toHaveBeenCalledWith(
        '[id="telegram-login-tmible_wishlist_bot"]',
        [ document.head, expect.any(HTMLElement) ],
      );
    });

    it('should add title to telegram login widget', async () => {
      const titleSetter = vi.spyOn(mockElement, 'title', 'set');
      await beforeUpdateHandler();
      expect(titleSetter).toHaveBeenCalledWith(expect.any(String));
    });

    it('should replace telegram login widget on beforeUpdateHandler', async () => {
      const [ telegramloginWidgetContainer ] = baseElement.querySelectorAll('.card-body');
      vi.spyOn(telegramloginWidgetContainer, 'append');
      await beforeUpdateHandler();
      expect(telegramloginWidgetContainer.append).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('if not visible', () => {
    beforeEach(() => {
      ({ baseElement } = render(Cards, { isVisible: false }));
    });

    it('should not wait for telegram login widget on beforeUpdateHandler', async () => {
      await beforeUpdateHandler();
      expect(vi.mocked(waitForElement)).not.toHaveBeenCalled();
    });

    it('should not add title to telegram login widget', async () => {
      const titleSetter = vi.spyOn(mockElement, 'title', 'set');
      await beforeUpdateHandler();
      expect(titleSetter).not.toHaveBeenCalled();
    });

    it('should not replace telegram login widget on beforeUpdateHandler', async () => {
      const [ telegramloginWidgetContainer ] = baseElement.querySelectorAll('.card-body');
      vi.spyOn(telegramloginWidgetContainer, 'append');
      await beforeUpdateHandler();
      expect(telegramloginWidgetContainer.append).not.toHaveBeenCalled();
    });
  });
});
