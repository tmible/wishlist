import { Mark } from '@tiptap/core';
import { markInputRule } from '../mark-input-rule.js';
import { markPasteRule } from '../mark-paste-rule.js';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы с командами бота */

/**
 * Регулярное выражение для определения команды бота в тексте при вводе
 * @constant {RegExp}
 */
const botCommandInputRegex = /(?:^|\s)((\/\S+)\s)$/;

/**
 * Регулярное выражение для определения команды бота в тексте при вставке
 * @constant {RegExp}
 */
const botCommandPasteRegex = /(?:^|\s)((\/\S+)\s)/g;

/**
 * Создание расширения текстового редактора для работы с командами бота
 * @see {@link https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark}
 * @see MarkConfig
 */
export default Mark.create({
  name: 'bot_command',

  parseHTML: () => [{
    tag: 'span[data-entity="bot_command"]',
  }],

  renderHTML: () => [ 'span', { class: 'link cursor-text' }, 0 ],

  addCommands() {
    return {
      setBotCommand: () => ({ commands }) => commands.setMark(this.name),
      toggleBotCommand: () => ({ commands }) => commands.toggleMark(this.name),
      unsetBotCommand: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },

  addInputRules() {
    return [
      markInputRule({
        find: botCommandInputRegex,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: botCommandPasteRegex,
        type: this.type,
      }),
    ];
  },
});
