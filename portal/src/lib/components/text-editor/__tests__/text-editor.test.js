// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/svelte';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { readable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TextEditor from '../text-editor.svelte';

vi.mock('$lib/store/breakpoints', () => ({ md: readable(null) }));

describe('text editor', () => {
  afterEach(() => {
    cleanup();
  });

  it('should provide current value in "display: none" textarea', async () => {
    const { container } = render(TextEditor, { name: 'name' });
    const { editor } = container.firstChild.firstChild;
    editor.unregisterPlugin(BubbleMenu.options.pluginKey);
    editor.commands.setContent('<b>bold content</b>\nplain <i>and italic</i>');
    await act();
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toMatchSnapshot();
  });
});
