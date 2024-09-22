// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { onMount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForElement } from '$lib/wait-for-element.js';
import Cards from '../cards.svelte';

vi.mock('$lib/wait-for-element.js');
vi.mock('svelte');

describe('cards', () => {
  let baseElement;
  let mountHandler;
  const mockElement = document.createElement('div');

  beforeEach(() => {
    vi.mocked(onMount).mockImplementation((...args) => [ mountHandler ] = args);
    vi.mocked(waitForElement).mockResolvedValue(mockElement);
    ({ baseElement } = render(Cards));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should wait for telegram login widget on mount', async () => {
    await mountHandler();
    expect(
      vi.mocked(waitForElement),
    ).toHaveBeenCalledWith(
      '[id="telegram-login-tmible_wishlist_bot"]',
      document.head,
    );
  });

  it('should replace telegram login widget on mount', async () => {
    const [ telegramloginWidgetContainer ] = baseElement.querySelectorAll('.card-body');
    vi.spyOn(telegramloginWidgetContainer, 'append');
    await mountHandler();
    expect(telegramloginWidgetContainer.append).toHaveBeenCalledWith(mockElement);
  });
});
