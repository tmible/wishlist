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
    if (option.activityKey === 'text_link') {
      textLinkInputValue = editor.getAttributes('text_link').href ?? 'https://';
      editor.commands.focus();
    } else {
      editor.chain().focus()[option.editorAction]().run();
    }
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
    if (option.activityKey === 'text_link') {
      textLinkInputValue = editor.getAttributes('text_link').href ?? 'https://';
    } else {
      event.preventDefault();
      editor.commands[option.editorAction]();
    }
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

{#snippet optionButton(option, children, props = {})}
  <button
    class="conditionally-join-item cursor-pointer"
    class:menu-active={option.activityKey && editor?.isActive(option.activityKey)}
    type="button"
    onclick={() => onFormattingMenuOptionClick(option)}
    ontouchstart={() => onFormattingMenuOptionTouchStart(option)}
    ontouchmove={() => onFormattingMenuOptionTouchMove(option)}
    ontouchcancel={() => onFormattingMenuOptionTouchCancel(option)}
    ontouchend={(event) => onFormattingMenuOptionTouchEnd(event, option)}
    {...props}
  >
    <option.icon class="w-5 h-5" />
    {@render children?.()}
  </button>
{/snippet}

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
              {#snippet buttonContent()}
                <span class="hidden md:inline">
                  {editor?.isActive('text_link') ? 'Изменить' : 'Добавить'} ссылку
                </span>
              {/snippet}
              {@render optionButton(option, buttonContent, props)}
            {/snippet}
          </Popover.Trigger>
        </li>
        <Popover.Portal>
          <Popover.Content
            class="bg-base-100 rounded-box shadow-xl py-4 px-6 z-1000"
            side={$md ? 'left' : 'top'}
          >
            <input
              class="input input-xs mb-3"
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
        {#snippet buttonContent()}
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
                <kbd class="kbd w-fit text-base-content text-[0.6rem]">{key}</kbd>
                {#if !isLast}
                  {@const plusWithSpaces = ' + '}
                  {plusWithSpaces}
                {/if}
              {/each}
            </div>
          {/if}
        {/snippet}
        {@render optionButton(option, buttonContent)}
      </li>
      {#if option.isLastInSection}
        <div class="divider my-1"></div>
        <div class="divider divider-horizontal mx-1"></div>
      {/if}
    {/if}
  {/each}
</ul>

<style>
  .conditionally-join-vertical *:has(:global(.conditionally-join-item.menu-active)) {
    &:has(:global(+ * .conditionally-join-item.menu-active)) .conditionally-join-item.menu-active {
      border-end-start-radius: 0;
      border-end-end-radius: 0;
      border-start-start-radius: var(--radius-field);
      border-start-end-radius: var(--radius-field);
    }

    & + *:has(:global(.conditionally-join-item.menu-active)) {
      & .conditionally-join-item.menu-active {
        border-radius: 0;
      }

      &:not(:has(+ * .conditionally-join-item.menu-active)) .conditionally-join-item.menu-active {
        border-end-start-radius: var(--radius-field);
        border-end-end-radius: var(--radius-field);
        border-start-start-radius: 0;
        border-start-end-radius: 0;
      }
    }
  }

  .conditionally-join-horizontal *:has(:global(.conditionally-join-item.menu-active)) {
    &:has(:global(+ * .conditionally-join-item.menu-active)) .conditionally-join-item.menu-active {
      border-end-start-radius: var(--radius-field);
      border-end-end-radius: 0;
      border-start-start-radius: var(--radius-field);
      border-start-end-radius: 0;
    }

    & + *:has(:global(.conditionally-join-item.menu-active)) {
      & .conditionally-join-item.menu-active {
        border-radius: 0;
      }

      &:not(:has(+ * .conditionally-join-item.menu-active)) .conditionally-join-item.menu-active {
        border-end-start-radius: 0;
        border-end-end-radius: var(--radius-field);
        border-start-start-radius: 0;
        border-start-end-radius: var(--radius-field);
      }
    }
  }
</style>
