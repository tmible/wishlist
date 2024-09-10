/* eslint-disable import/no-internal-modules --
   Сгруппированные подмодули. Не настраивается в конфиге -_- */
import { Blockquote } from '@tiptap/extension-blockquote';
import BoldExtension from '@tiptap/extension-bold';
import CodeExtension from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { History } from '@tiptap/extension-history';
import ItalicExtension from '@tiptap/extension-italic';
import LinkExtension from '@tiptap/extension-link';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { Typography } from '@tiptap/extension-typography';
import UnderlineExtension from '@tiptap/extension-underline';
import BotCommand from './extensions/bot-command.js';
import Cashtag from './extensions/cashtag.js';
import Email from './extensions/email.js';
import Hashtag from './extensions/hashtag.js';
import Mention from './extensions/mention.js';
import Phone from './extensions/phone.js';
import Spoiler from './extensions/spoiler.js';
import TextLink from './extensions/text-link.js';

/* eslint-enable import/no-internal-modules */

/** @typedef {import('@tiptap/core').EditorOptions} EditorOptions */

/**
 * Статичная часть конфигурации текстового редактора
 * @constant {EditorOptions}
 */
export const textEditorConfig = {
  extensions: [
    Blockquote,
    BoldExtension,
    BotCommand,
    Cashtag,
    CodeExtension,
    CodeBlock,
    Document,
    Email,
    Hashtag,
    History,
    ItalicExtension,
    LinkExtension
      .extend({
        parseHTML: () => [{
          tag: 'a[href]:not([data-entity])',
          getAttrs: (...args) => {
            LinkExtension.config.options = LinkExtension.config.addOptions();
            return LinkExtension.config.parseHTML()[0].getAttrs(...args);
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
    UnderlineExtension,
  ],
};
