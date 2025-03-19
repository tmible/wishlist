<!-- Svelte компонент -- тексторый редактор -->
<script>
  import { Popover } from 'bits-ui';
  import { md } from '$lib/store/breakpoints.js';
  import { formattingMenu } from './formatting-menu.const.js';

  /** @typedef {import('./formatting-menu.const.js').FormattingMenuOption} FormattingMenuOption */

  /**
   * @typedef {object} Props
   * @property {import('@tiptap/core').Editor} editor Текстовый редактор
   */

  /** @type {Props} */
  const { editor } = $props();

  /**
   * Адрес выделенной ссылки с текстом, не совпадающим с адресом
   * @type {string}
   */
  let textLinkInputValue = $state('');

  /**
   * Обработчик клика по опции меню форматирования
   * @function onFormattingMenuOptionClick
   * @param {FormattingMenuOption} option Кликнутая опция меню
   * @returns {void}
   * @see FormattingMenuOption.editorAction
   */
  const onFormattingMenuOptionClick = (option) => {
    editor.chain().focus()[option.editorAction]().run();
  };

  /**
   * Обработчик начала касания опции меню форматирования.
   * Установка значения isTouchedDirectly в true
   * @function onFormattingMenuOptionTouchStart
   * @param {FormattingMenuOption} option Опция меню, которой коснулся пользователь
   * @returns {void}
   * @see FormattingMenuOption.isTouchedDirectly
   */
  const onFormattingMenuOptionTouchStart = (option) => option.isTouchedDirectly = true;

  /**
   * Обработчик движения касания опции меню форматирования
   * @function onFormattingMenuOptionTouchMove
   * @param {FormattingMenuOption} option Опция меню, которой коснулся пользователь
   * @returns {void}
   * @see FormattingMenuOption.isTouchedDirectly
   */
  const onFormattingMenuOptionTouchMove = (option) => option.isTouchedDirectly = false;

  /**
   * Обработчик отмены касания опции меню форматирования
   * @function onFormattingMenuOptionTouchCancel
   * @param {FormattingMenuOption} option Опция меню, которой коснулся пользователь
   * @returns {void}
   * @see FormattingMenuOption.isTouchedDirectly
   */
  const onFormattingMenuOptionTouchCancel = (option) => option.isTouchedDirectly = false;

  /**
   * Обработчик окончания касания опции меню форматирования
   * @function onFormattingMenuOptionTouchEnd
   * @param {CustomEvent} event Событие окончания касания
   * @param {FormattingMenuOption} option Опция меню, которой коснулся пользователь
   * @returns {void}
   * @see FormattingMenuOption.isTouchedDirectly
   */
  const onFormattingMenuOptionTouchEnd = (event, option) => {
    if (!option.isTouchedDirectly) {
      return;
    }
    event.preventDefault();
    editor.commands[option.editorAction]();
  };

  /**
   * Обработчик клика по опции меню форматирования для настройки
   * ссылки, текст которой не совпадает с адресом
   * @function onFormattingMenuLinkOptionClick
   * @returns {void}
   */
  const onFormattingMenuLinkOptionClick = () => {
    textLinkInputValue = editor.getAttributes('text_link').href ?? 'https://';
    editor.commands.focus();
  };

  /**
   * Обработчик окончания касания опции меню форматирования
   * для настройки ссылки, текст которой не совпадает с адресом
   * @function onFormattingMenuLinkOptionTouchEnd
   * @param {FormattingMenuOption} option Опция меню, которой коснулся пользователь
   * @returns {void}
   * @see FormattingMenuOption.isTouchedDirectly
   */
  const onFormattingMenuLinkOptionTouchEnd = (option) => {
    if (!option.isTouchedDirectly) {
      return;
    }
    textLinkInputValue = editor.getAttributes('text_link').href ?? 'https://';
  };

  /**
   * Обработчик нажатия кнопки удаления или отмены добавления
   * ссылки, текст которой не совпадает с адресом
   * @function onFormattingMenuLinkPopupNegativeClick
   * @returns {void}
   */
  const onFormattingMenuLinkPopupNegativeClick = () => {
    if (!editor.isActive('text_link')) {
      editor.commands.focus();
      return;
    }
    editor.chain().focus().unsetTextLink().run();
  };

  /**
   * Обработчик нажатия кнопки добавления или подтверждения
   * изменения ссылки, текст которой не совпадает с адресом
   * @function onFormattingMenuLinkPopupPositiveClick
   * @returns {void}
   */
  const onFormattingMenuLinkPopupPositiveClick = () => {
    editor.chain().focus().setTextLink({ href: textLinkInputValue }).run();
  };
</script>

<ul
  id="text-editor-bubble-menu"
  class="
    menu
    text-xs
    bg-base-100
    rounded-t-lg
    md:rounded-box
    not-prose
    shadow-xl
    overflow-auto
    w-dvw
    md:w-auto
    flex-row
    md:flex-col
    flex-nowrap
  "
  class:conditionally-join-horizontal={!$md}
  class:conditionally-join-vertical={$md}
>
  {#each formattingMenu as option (option.label)}
    {#if option.label === 'Добавить ссылку'}
      <Popover.Root>
        <li>
          <Popover.Trigger>
            {#snippet child({ props })}
              <button
                class:active={editor?.isActive('text_link')}
                type="button"
                onclick={onFormattingMenuLinkOptionClick}
                ontouchstart={() => onFormattingMenuOptionTouchStart(option)}
                ontouchmove={() => onFormattingMenuOptionTouchMove(option)}
                ontouchcancel={() => onFormattingMenuOptionTouchCancel(option)}
                ontouchend={() => onFormattingMenuLinkOptionTouchEnd(option)}
                {...props}
              >
                <option.icon class="w-5 h-5" />
                <span class="hidden md:inline">
                  {editor?.isActive('text_link') ? 'Изменить' : 'Добавить'} ссылку
                </span>
              </button>
            {/snippet}
          </Popover.Trigger>
        </li>
        <Popover.Portal>
          <Popover.Content
            class="bg-base-100 rounded-box shadow-xl py-4 px-6"
            side={$md ? 'left' : 'top'}
          >
            <input
              class="input input-xs input-bordered mb-3"
              type="text"
              placeholder="Адрес ссылки"
              bind:value={textLinkInputValue}
            >
            <div class="flex gap-1">
              <Popover.Close
                class="btn btn-xs btn-neutral grow"
                type="button"
                onclick={onFormattingMenuLinkPopupNegativeClick}
              >
                {editor.isActive('text_link') ? 'Удалить' : 'Отмена'}
              </Popover.Close>
              <Popover.Close
                class="btn btn-xs btn-neutral grow"
                type="button"
                onclick={onFormattingMenuLinkPopupPositiveClick}
              >
                {editor.isActive('text_link') ? 'Сохранить' : 'Добавить'}
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    {:else}
      <li>
        <button
          class="conditionally-join-item"
          class:active={option.activityKey && editor?.isActive(option.activityKey)}
          type="button"
          onclick={() => onFormattingMenuOptionClick(option)}
          ontouchstart={() => onFormattingMenuOptionTouchStart(option)}
          ontouchmove={() => onFormattingMenuOptionTouchMove(option)}
          ontouchcancel={() => onFormattingMenuOptionTouchCancel(option)}
          ontouchend={(event) => onFormattingMenuOptionTouchEnd(event, option)}
        >
          <option.icon class="w-5 h-5" />
          {#if option.labelTag}
            <svelte:element
              this={option.labelTag}
              class="hidden md:inline"
            >
              {option.label}
            </svelte:element>
          {:else}
            <span class="hidden md:inline">{option.label}</span>
          {/if}
          {#if option.keys}
            <div class="hidden md:block">
              {#each option.keys as key (key)}
                {@const isLast = key === option.keys.at(-1)}
                <kbd class="kbd w-fit">{key}</kbd>
                {#if !isLast}
                  {@const plusWithSpaces = ' + '}
                  {plusWithSpaces}
                {/if}
              {/each}
            </div>
          {/if}
        </button>
      </li>
      {#if option.isLastInSection}
        <div class="divider my-1"></div>
        <div class="divider divider-horizontal mx-1"></div>
      {/if}
    {/if}
  {/each}
</ul>

<style>
  kbd {
    @apply text-base-content;
    font-size: 0.6rem;
  }

  .conditionally-join-vertical *:has(:global(.conditionally-join-item.active)) {
    &:has(:global(+ * .conditionally-join-item.active)) .conditionally-join-item.active {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      border-start-start-radius: var(--rounded-btn);
      border-start-end-radius: var(--rounded-btn);
    }

    & + *:has(:global(.conditionally-join-item.active)) {
      & .conditionally-join-item.active {
        border-radius: 0;
      }

      &:not(:has(+ * .conditionally-join-item.active)) .conditionally-join-item.active {
        border-end-start-radius: var(--rounded-btn);
        border-end-end-radius: var(--rounded-btn);
        border-start-start-radius: 0;
        border-start-end-radius: 0;
      }
    }
  }

  .conditionally-join-horizontal *:has(:global(.conditionally-join-item.active)) {
    &:has(:global(+ * .conditionally-join-item.active)) .conditionally-join-item.active {
      border-end-start-radius: var(--rounded-btn);
      border-end-end-radius: 0;
      border-start-start-radius: var(--rounded-btn);
      border-start-end-radius: 0;
    }

    & + *:has(:global(.conditionally-join-item.active)) {
      & .conditionally-join-item.active {
        border-radius: 0;
      }

      &:not(:has(+ * .conditionally-join-item.active)) .conditionally-join-item.active {
        border-end-start-radius: 0;
        border-end-end-radius: var(--rounded-btn);
        border-start-start-radius: 0;
        border-start-end-radius: var(--rounded-btn);
      }
    }
  }
</style>
