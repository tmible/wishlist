import { Mark, mergeAttributes } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с адресами почты */

/**
 * Регулярное выражение для определения адреса почты в тексте при вводе
 * @constant {RegExp}
 */
const emailInputRegex = /(?:^|\s)(([\w.-]+@(?:[\w-]+\.)+[\w-]{2,})\s)$/;

/**
 * Регулярное выражение для определения адреса почты в тексте при вставке
 * @constant {RegExp}
 */
const emailPasteRegex = /(?:^|\s)(([\w.-]+@(?:[\w-]+\.)+[\w-]{2,})\s)/g;

/**
 * Создание расширения текстового редактора для работы с адресами почты
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'email',

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
    tag: 'a[data-entity="email"]',
  }],

  renderHTML({ HTMLAttributes }) {
    return [ 'a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ];
  },

  addCommands() {
    return {
      setEmail: (attributes) => ({ commands }) => commands.setMark(this.name, attributes),
      toggleEmail: (attributes) => ({ commands }) => commands.toggleMark(this.name, attributes),
      unsetEmail: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: emailInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `mailto:${match[1].trim()}`,
        }),
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: emailPasteRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `mailto:${match[1].trim()}`,
        }),
      }),
    ];
  },
});
