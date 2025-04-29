// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ModalPortal from '../modal-portal.svelte';

describe('modal portal', () => {
  let baseElement;
  let container;

  beforeEach(() => {
    ({ baseElement, container } = render(ModalPortal));
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should be displayed', () => {
    expect(baseElement).toMatchSnapshot();
  });

  it('should add open attribute', async () => {
    const child = document.createElement('div');
    container.firstChild.append(child);
    await vi.waitFor(() => expect(container.firstChild.hasAttribute('open')).toBe(true));
  });

  it('should remove open attribute', async () => {
    const child = document.createElement('div');
    container.firstChild.append(child);
    await vi.waitFor(() => expect(container.firstChild.hasAttribute('open')).toBe(true));
    child.remove();
    await vi.waitFor(() => expect(container.firstChild.hasAttribute('open')).toBe(false));
  });
});
