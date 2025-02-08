import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { History } from '@tiptap/extension-history';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import BotCommand from './extensions/bot-command.js';
import Cashtag from './extensions/cashtag.js';
import Email from './extensions/email.js';
import Hashtag from './extensions/hashtag.js';
import Mention from './extensions/mention.js';
import Phone from './extensions/phone.js';
import Spoiler from './extensions/spoiler.js';
import TextLink from './extensions/text-link.js';

/** @typedef {import('@tiptap/core').EditorOptions} EditorOptions */

/**
 * Статичная часть конфигурации текстового редактора
 * @constant {EditorOptions}
 */
export const textEditorConfig = {
  extensions: [
    Blockquote,
    Bold,
    BotCommand,
    Cashtag,
    Code,
    CodeBlock,
    Document,
    Email,
    Hashtag,
    History,
    Italic,
    Link
      .extend({
        parseHTML: () => [{
          tag: 'a[href]:not([data-entity])',
          getAttrs: (...args) => {
            Link.config.options = Link.config.addOptions();
            return Link.config.parseHTML()[0].getAttrs(...args);
          },
        }],
      })
      .configure({
        protocols: [{
          scheme: 'mailto',
          optionalSlashes: true,
        }, {
          scheme: 'tel',
          optionalSlashes: true,
        }],
        HTMLAttributes: {
          class: 'cursor-pointer',
        },
      }),
    Mention,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'my-0',
      },
    }),
    Phone,
    Spoiler,
    Strike,
    Text.extend({
      addKeyboardShortcuts() {
        return {
          'Mod- ': () => this.editor.chain().focus().unsetAllMarks().run(),
        };
      },
    }),
    TextLink,
    Typography.configure({
      openDoubleQuote: '«',
      closeDoubleQuote: '»',
    }),
    Underline,
  ],
};
