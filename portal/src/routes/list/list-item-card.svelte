<!-- Svelte компонент -- карточка элемента списка -->
<script>
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import { createEventDispatcher } from 'svelte';
  import TelegramEntitiesParser from '$lib/components/telegram-entities/parser.svelte';
  import ListItemForm from './list-item-form.svelte';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * Диспетчер событий
   * @type {import('svelte').EventDispatcher}
   */
  const dispatch = createEventDispatcher();

  /**
   * Элемент списка
   * @type {OwnListItem}
   */
  export let listItem = null;

  /**
   * Признак отображения карточки без контента при загрузке
   * @type {boolean}
   */
  export let isSkeleton = false;

  /**
   * Форма из родительского компонента для использования form actions
   * @type {import('./$types').ActionData}
   * @see {@link https://kit.svelte.dev/docs/form-actions}
   */
  export let form = null;

  /**
   * Признак отображения карточки в режиме редактирования элемента (с формой вместо контента)
   * @type {boolean}
   */
  let isEditingModeOn = false;

  /**
   * Элемент, содержащий описание элемента списка
   * @type {HTMLElement}
   */
  let description;

  /**
   * Текущие значения свойств элемента списка для подстановку в форму в режиме редактирования
   * @type {OwnListItem}
   */
  let values;

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
    dispatch('refreshlist');
  };

  /**
   * Выпуск события удаления элемента
   * @function deleteItem
   * @returns {void}
   */
  const deleteItem = () => dispatch('delete', listItem);
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
  <div class="card bg-base-100 md:shadow-xl">
    <div class="card-body prose">
      {#if isEditingModeOn}
        <ListItemForm
          {form}
          {values}
          on:cancel={cancelEditItem}
          on:success={finishEditItem}
        />
      {:else}
        <h2 class="card-title">{listItem.name}</h2>
        <div bind:this={description} class="prose">
          <TelegramEntitiesParser
            text={listItem.description}
            entities={listItem.descriptionEntities ?? []}
          />
        </div>
        <div class="card-actions pt-4">
          <button class="btn btn-outline btn-neutral w-full md:flex-1" on:click={editItem}>
            <Pencil />
            Редактировать
          </button>
          <button class="btn btn-outline btn-error w-full md:flex-1" on:click={deleteItem}>
            <Trash2 />
            Удалить
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
