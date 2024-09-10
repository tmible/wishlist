import { describe, expect, it } from 'vitest';
import { lineBreaksToBreakpoints } from '../line-breaks-to-breakpoints.js';

describe('lineBreaksToBreakpoints', () => {
  let text;

  it('should convert line breaks to breakpoints for single line text', () => {
    text = 'single line text';
    expect(
      lineBreaksToBreakpoints(Array.from(text.matchAll(/(?!^)\n(?!$)/g)), text.length),
    ).toMatchSnapshot();
  });

  it('should convert line breaks to breakpoints for text with several lines', () => {
    text = '\nseveral\nlines\ntext\n';
    expect(
      lineBreaksToBreakpoints(Array.from(text.matchAll(/(?!^)\n(?!$)/g)), text.length),
    ).toMatchSnapshot();
  });
});
