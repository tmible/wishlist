// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet, tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Hint from '../hint.svelte';

let triggerParams;
const trigger = createRawSnippet(
  (params) => {
    triggerParams = params();
    return { render: () => '<span>trigger</span>' };
  },
);
const content = createRawSnippet(() => ({ render: () => '<span>content</span>' }));

describe('hint', () => {
  afterEach(() => {
    triggerParams = undefined;
    vi.clearAllMocks();
    cleanup();
  });

  it('should show hint on trigger click', async () => {
    render(Hint, { trigger, content });
    triggerParams?.onClick?.(new Event('click'));
    await tick();
    expect(screen.getByText('content')).toBeDefined();
  });

  it('should hide hint on trigger click', async () => {
    render(Hint, { trigger, content });
    triggerParams?.onClick?.(new Event('click'));
    triggerParams?.onClick?.(new Event('click'));
    await tick();
    expect(screen.queryByText('content')).toBeNull();
  });

  it('should hide hint on global mousedown', async () => {
    render(Hint, { trigger, content });
    triggerParams?.onClick?.(new Event('click'));
    globalThis.dispatchEvent(new Event('mousedown'));
    await tick();
    expect(screen.queryByText('content')).toBeNull();
  });
});
