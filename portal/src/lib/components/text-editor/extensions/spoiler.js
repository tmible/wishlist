import { Mark, markInputRule, markPasteRule } from '@tiptap/core';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы со скрытым текстом */

/**
 * Регулярное выражение для определения скрытого текста в тексте при вводе
 * @constant {RegExp}
 */
const spoilerInputRegex = /(?:^|\s)(\|\|(?!\s+\|\|)([^|]+)\|\|)$/;

/**
 * Регулярное выражение для определения скрытого текста в тексте при вставке
 * @constant {RegExp}
 */
const spoilerPasteRegex = /(?:^|\s)(\|\|(?!\s+\|\|)([^|]+)\|\|(?!\s+\|\|))/g;

/**
 * Создание расширения текстового редактора для работы со скрытым текстом
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'spoiler',

  parseHTML: () => [{
    tag: 'span[data-entity="spoiler"]',
  }],

  renderHTML: () => [ 'span', { class: 'spoiler text-transparent hover:text-base-content' }, 0 ],

  addCommands() {
    return {
      setSpoiler: () => ({ commands }) => commands.setMark(this.name),
      toggleSpoiler: () => ({ commands }) => commands.toggleMark(this.name),
      unsetSpoiler: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-p': () => this.editor.commands.toggleSpoiler(),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: spoilerInputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: spoilerPasteRegex,
        type: this.type,
      }),
    ];
  },
});
