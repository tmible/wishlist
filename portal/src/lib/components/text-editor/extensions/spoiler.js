import { Mark } from '@tiptap/core';

/** @typedef {import('@tiptap/core').MarkConfig} MarkConfig */

/** @module Расширение текстового редактора для работы со скрытым текстом */

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
});
