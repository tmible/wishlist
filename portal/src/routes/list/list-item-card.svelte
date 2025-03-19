<!-- Svelte компонент -- карточка элемента списка -->
<script>
  import GripVertical from 'lucide-svelte/icons/grip-vertical';
  import LayoutGrid from 'lucide-svelte/icons/layout-grid';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import TelegramEntitiesParser from '$lib/components/telegram-entities/parser.svelte';
  import ListItemForm from './list-item-form.svelte';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * @typedef {object} Props
   * @property {OwnListItem} [listItem] Элемент списка
   * @property {boolean} [isReorderModeOn] Признак режима переупорядочивания списка
   * @property {boolean} [isSkeleton] Признак отображения карточки без контента при загрузке
   * @property {() => void} [ondelete] Функция обратного вызова для удаления элемента
   * @property {() => void} [refreshlist] Функция обратного вызова для обновления списка
   */

  /** @type {Props} */
  const {
    listItem = null,
    isReorderModeOn = false,
    isSkeleton = false,
    ondelete,
    refreshlist,
  } = $props();

  /**
   * Признак отображения карточки в режиме редактирования элемента (с формой вместо контента)
   * @type {boolean}
   */
  let isEditingModeOn = $state(false);

  /**
   * Элемент, содержащий описание элемента списка
   * @type {HTMLElement}
   */
  let description = $state();

  /**
   * Текущие значения свойств элемента списка для подстановку в форму в режиме редактирования
   * @type {OwnListItem}
   */
  let values = $state();

  /**
   * Переключение в режим редактирования
   * @function editItem
   * @returns {void}
   */
  const editItem = () => {
    values = { ...listItem, description: description.innerHTML };
    isEditingModeOn = true;
  };

  /**
   * Переключение в режим просмотра без сохранения изменений
   * @function cancelEditItem
   * @returns {void}
   */
  const cancelEditItem = () => isEditingModeOn = false;

  /**
   * Переключение в режим просмотра с сохранением изменений
   * @function finishEditItem
   * @returns {void}
   */
  const finishEditItem = () => {
    isEditingModeOn = false;
    refreshlist();
  };

  /**
   * Выпуск события удаления элемента
   * @function deleteItem
   * @returns {void}
   */
  const deleteItem = () => ondelete(listItem);
</script>

{#if isSkeleton}
  <div class="card bg-base-100 md:shadow-xl">
    <div class="card-body prose">
      <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
      <h2 class="skeleton card-title">&nbsp;</h2>
      <p>
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <span class="skeleton mb-px block">&nbsp;</span>
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <span class="skeleton mb-px block">&nbsp;</span>
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <span class="skeleton mb-px block">&nbsp;</span>
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <span class="skeleton mb-px block">&nbsp;</span>
      </p>
      <div class="card-actions">
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <button class="skeleton btn btn-neutral w-full md:flex-1">&nbsp;</button>
        <!-- eslint-disable-next-line svelte/html-self-closing -- тег не пустой -->
        <button class="skeleton btn btn-neutral w-full md:flex-1">&nbsp;</button>
      </div>
    </div>
  </div>
{:else}
  <div
    class="card bg-base-100 md:shadow-xl"
    class:cursor-grab={isReorderModeOn}
    class:select-none={isReorderModeOn}
    data-id={listItem.id}
  >
    <div class="card-body prose">
      {#if isEditingModeOn}
        <ListItemForm
          {values}
          cancel={cancelEditItem}
          success={finishEditItem}
        />
      {:else}
        <h3 class="card-title" class:mb-0={isReorderModeOn}>
          {#if isReorderModeOn}
            <GripVertical class="text-neutral-content" />
          {/if}
          {listItem.name}
        </h3>
        {#if !isReorderModeOn}
          <div bind:this={description} class="prose">
            <TelegramEntitiesParser
              text={listItem.description}
              entities={listItem.descriptionEntities ?? []}
            />
          </div>
          {#if listItem.category.id}
            <div class="flex items-center">
              <LayoutGrid class="w-4 h-4 mr-2" />
              {listItem.category.name}
            </div>
          {/if}
          <div class="card-actions pt-4">
            <button class="btn btn-outline btn-neutral w-full md:flex-1" onclick={editItem}>
              <Pencil />
              Редактировать
            </button>
            <button class="btn btn-outline btn-error w-full md:flex-1" onclick={deleteItem}>
              <Trash2 />
              Удалить
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}
