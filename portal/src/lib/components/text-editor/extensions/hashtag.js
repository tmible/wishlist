import { Mark } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с хэштегами */

/**
 * Регулярное выражение для определения хэштега в тексте при вводе
 * @constant {RegExp}
 */
const hashtagInputRegex = /(?:^|\s)((#[^\s#]+)\s)$/;

/**
 * Регулярное выражение для определения хэштега в тексте при вставке
 * @constant {RegExp}
 */
const hashtagPasteRegex = /(?:^|\s)((#[^\s#]+)\s)/g;

/**
 * Создание расширения текстового редактора для работы с хэштегами
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'hashtag',

  parseHTML: () => [{
    tag: 'span[data-entity="hashtag"]',
  }],

  renderHTML: () => [ 'span', { class: 'link cursor-text' }, 0 ],

  addCommands() {
    return {
      setHashtag: () => ({ commands }) => commands.setMark(this.name),
      toggleHashtag: () => ({ commands }) => commands.toggleMark(this.name),
      unsetHashtag: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: hashtagInputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: hashtagPasteRegex,
        type: this.type,
      }),
    ];
  },
});
