import { Mark, mergeAttributes } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с упоминаниями пользователя */

/**
 * Регулярное выражение для определения упоминания пользователя в тексте при вводе
 * @constant {RegExp}
 */
const mentionInputRegex = /(?:^|\s)((@[^\s@]+)\s)$/;

/**
 * Регулярное выражение для определения упоминания пользователя в тексте при вставке
 * @constant {RegExp}
 */
const mentionPasteRegex = /(?:^|\s)((@[^\s@]+)\s)/g;

/**
 * Создание расширения текстового редактора для работы с упоминаниями пользователя
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'mention',

  addAttributes: () => ({
    href: {
      default: null,
      parseHTML: (element) => element.getAttribute('href'),
    },
    target: {
      default: '_blank',
    },
    rel: {
      default: 'noopener noreferrer nofollow',
    },
    class: {
      default: 'cursor-pointer',
    },
  }),

  parseHTML: () => [{
    tag: 'a[data-entity="mention"]',
  }],

  renderHTML({ HTMLAttributes }) {
    return [ 'a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ];
  },

  addCommands() {
    return {
      setMention: (attributes) => ({ commands }) => commands.setMark(this.name, attributes),
      toggleMention: (attributes) => ({ commands }) => commands.toggleMark(this.name, attributes),
      unsetMention: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: mentionInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `https://t.me/${match[1].slice(1).trim()}`,
        }),
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: mentionPasteRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `https://t.me/${match[1].slice(1).trim()}`,
        }),
      }),
    ];
  },
});
