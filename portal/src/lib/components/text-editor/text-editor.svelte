<!-- Svelte компонент -- тексторый редактор -->
<script>
  import { Editor } from '@tiptap/core';
  import { BubbleMenu } from '@tiptap/extension-bubble-menu';
  import { Placeholder } from '@tiptap/extension-placeholder';
  import { onDestroy, onMount } from 'svelte';
  import { md } from '$lib/store/breakpoints.js';
  import { textEditorConfig } from './config.const.js';
  import FormattingMenu from './formatting-menu.svelte';

  /**
   * @typedef {object} Props
   * @property {string} name Имя элемента ввода (для коректной работы в формах)
   * @property {string} [className] CSS классы для текстового редактора
   * @property {string} [value] Начальный текст для отображения в текстовом редакторе
   * @property {string} [placeholder] Плейсхолдер для текстового редактора
   */

  /** @type {Props} */
  const {
    name,
    className = '',
    value = '',
    placeholder = '',
  } = $props();

  /**
   * Элемент для отображеня текстового редактора
   * @type {HTMLElement}
   */
  let element = $state();

  /**
   * Текстовый редактор
   * @type {Editor}
   */
  let editor = $state();

  /**
   * Текущее значение текста в редакторе
   * @type {string}
   */
  const currentValue = $derived(editor?.getJSON ? JSON.stringify(editor.getJSON()) : value);

  /**
   * Создание [текстового редатктора]{@link editor} при создании компонента
   */
  onMount(() => editor = new Editor({
    ...textEditorConfig,
    extensions: [
      ...textEditorConfig.extensions,
      BubbleMenu.configure({
        element: document.querySelector('#text-editor-bubble-menu'),
        tippyOptions: {
          ...($md ?
            {
              placement: 'right',
            } :
            {
              maxWidth: 'none',
              appendTo: () => document.documentElement,
              offset: [ 0, 0 ],
              getReferenceClientRect: () => ({
                left: 0,
                bottom: 0,
              }),
              popperOptions: {
                strategy: 'fixed',
              },
            }
          ),
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    element,
    content: value,
    onTransaction: () => {
      // Force re-render so `editor.isActive` works as expected
      const tmp = editor;
      editor = null;
      editor = tmp;
    },
    editorProps: {
      attributes: {
        class: `${className}${className ? ' ' : ''}cursor-text overflow-y-auto resize-y prose-sm`,
      },
    },
  }));

  /**
   * Уничтожение [текстового редатктора]{@link editor} при уничтожении компонента
   */
  onDestroy(() => editor?.destroy());
</script>

<div bind:this={element} class="contents"></div>
<textarea
  {name}
  class="hidden"
  value={currentValue}
  data-testid="not-displayed-textarea"
></textarea>
<FormattingMenu {editor} />

<style>
  :global(.tiptap p.is-editor-empty:first-child::before) {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
</style>
