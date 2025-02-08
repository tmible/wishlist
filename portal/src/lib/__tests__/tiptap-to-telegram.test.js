import { describe, expect, it } from 'vitest';
import { tiptapToTelegram } from '../tiptap-to-telegram.js';
import content from './tiptap-to-telegram-content.json' with { type: 'json' };

describe('tiptapToTelegram', () => {
  it('should convert tiptap tree to string and telegram message entities', () => {
    expect(tiptapToTelegram(content)).toMatchSnapshot();
  });
});
