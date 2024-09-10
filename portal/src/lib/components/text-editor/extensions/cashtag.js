import { Mark } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с кэштегами */

/**
 * Регулярное выражение для определения кэштега в тексте при вводе
 * @constant {RegExp}
 */
const cashtagInputRegex = /(?:^|\s)((\$[A-Z]{3,8})\s)$/;

/**
 * Регулярное выражение для определения кэштега в тексте при вставке
 * @constant {RegExp}
 */
const cashtagPasteRegex = /(?:^|\s)((\$[A-Z]{3,8})\s)/g;

/**
 * Создание расширения текстового редактора для работы с кэштегами
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'cashtag',

  parseHTML: () => [{
    tag: 'span[data-entity="cashtag"]',
  }],

  renderHTML: () => [ 'span', { class: 'link cursor-text' }, 0 ],

  addCommands() {
    return {
      setCashtag: () => ({ commands }) => commands.setMark(this.name),
      toggleCashtag: () => ({ commands }) => commands.toggleMark(this.name),
      unsetCashtag: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: cashtagInputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: cashtagPasteRegex,
        type: this.type,
      }),
    ];
  },
});
