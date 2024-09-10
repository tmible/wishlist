<!-- Svelte компонент -- тексторый редактор -->
<script>
  import { Editor } from '@tiptap/core';
  /* eslint-disable-next-line
     import/default, import/no-named-as-default, import/no-named-as-default-member --
     Ошибка из-за версии eslint */
  import BubbleMenu from '@tiptap/extension-bubble-menu';
  /* eslint-disable-next-line
     import/default, import/no-named-as-default, import/no-named-as-default-member --
     Ошибка из-за версии eslint */
  import Placeholder from '@tiptap/extension-placeholder';
  import { onDestroy, onMount } from 'svelte';
  import { md } from '$lib/store/breakpoints.js';
  import { textEditorConfig } from './config.const.js';
  import FormattingMenu from './formatting-menu.svelte';

  /**
   * Имя элемента ввода (для коректной работы в формах)
   * @type {string}
   */
  export let name;

  /**
   * CSS классы для текстового редактора
   * @type {string}
   */
  export let className = '';

  /**
   * Начальный текст для отображения в текстовом редакторе
   * @type {string}
   */
  export let value = '';

  /**
   * Плейсхолдер для текстового редактора
   * @type {string}
   */
  export let placeholder = '';

  /**
   * Элемент для отображеня текстового редактора
   * @type {HTMLElement}
   */
  let element;

  /**
   * Текстовый редактор
   * @type {Editor}
   */
  let editor;

  /**
   * Текущее значение текста в редакторе
   * @type {string}
   */
  $: currentValue = editor?.getJSON ? JSON.stringify(editor.getJSON()) : value;

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
          placement: 'right',
          ...($md ?
            {} :
            {
              maxWidth: 'none',
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
      editor = editor;
    },
    editorProps: {
      attributes: {
        class: `${className}${className ? ' ' : ''}cursor-text overflow-y-auto resize-y prose`,
      },
    },
  }));

  /**
   * Уничтожение [текстового редатктора]{@link editor} при уничтожении компонента
   */
  onDestroy(() => editor?.destroy());
</script>

<div bind:this={element} class="contents" />
<textarea {name} class="hidden" value={currentValue} />
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
