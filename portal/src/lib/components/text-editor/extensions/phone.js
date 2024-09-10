import { Mark, mergeAttributes } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с номерами телефона */

/**
 * Регулярное выражение для определения номера телефона в тексте при вводе
 * @constant {RegExp}
 */
const phoneInputRegex = /(?:^|\s)((\+\d{11}|\d{10})\s)$/;

/**
 * Регулярное выражение для определения номера телефона в тексте при вставке
 * @constant {RegExp}
 */
const phonePasteRegex = /(?:^|\s)((\+\d{11}|\d{10})\s)/g;

/**
 * Создание расширения текстового редактора для работы с номерами телефона
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'phone_number',

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
    tag: 'a[data-entity="phone_number"]',
  }],

  renderHTML({ HTMLAttributes }) {
    return [ 'a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ];
  },

  addCommands() {
    return {
      setPhone: (attributes) => ({ commands }) => commands.setMark(this.name, attributes),
      togglePhone: (attributes) => ({ commands }) => commands.toggleMark(this.name, attributes),
      unsetPhone: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: phoneInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `tel:${match[1].trim()}`,
        }),
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: phonePasteRegex,
        type: this.type,
        getAttributes: (match) => ({
          href: `tel:${match[1].trim()}`,
        }),
      }),
    ];
  },
});
