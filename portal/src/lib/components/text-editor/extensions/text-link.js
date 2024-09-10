import { Mark, mergeAttributes } from '@tiptap/core';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/**
 * @module Расширение текстового редактора для работы со ссылками с текстом, не совпадающим
 * с адресом
 */

/**
 * Создание расширения текстового редактора для работы
 * со ссылками с текстом, не совпадающим с адресом
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'text_link',

  addAttributes: () => ({
    href: {
      default: '',
      parseHTML: (element) => element.getAttribute('href'),
    },
    class: {
      default: 'cursor-pointer',
    },
  }),

  parseHTML: () => [{
    tag: 'a[data-entity="text_link"]',
  }],

  renderHTML({ HTMLAttributes }) {
    return [ 'a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0 ];
  },

  addCommands() {
    return {
      setTextLink: (attributes) => ({ commands }) => commands.setMark(this.name, attributes),
      toggleTextLink: (attributes) => ({ commands }) => commands.toggleMark(this.name, attributes),
      unsetTextLink: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },
});
