<!-- @component Карточка элемента списка желаний -->
<script>
  import GripVertical from 'lucide-svelte/icons/grip-vertical';
  import LayoutGrid from 'lucide-svelte/icons/layout-grid';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import TelegramEntitiesParser from '$lib/components/telegram-entities/parser.svelte';
  import ItemForm from './item-form.svelte';

  /** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * @typedef {object} Props
   * @property {OwnWishlistItem} [item] Элемент списка желаний
   * @property {boolean} [isReorderModeOn] Признак режима переупорядочивания списка
   * @property {boolean} [isSkeleton] Признак отображения карточки без контента при загрузке
   * @property {() => void} [ondelete] Функция обратного вызова для удаления элемента
   */

  /** @type {Props} */
  const {
    item = null,
    isReorderModeOn = false,
    isSkeleton = false,
    ondelete,
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
   * @type {OwnWishlistItem}
   */
  let values = $state();

  /**
   * Переключение в режим редактирования
   * @function editItem
   * @returns {void}
   */
  const editItem = () => {
    values = { ...item, description: description.innerHTML };
    isEditingModeOn = true;
  };

  /**
   * Переключение в режим просмотра
   * @function finishEditItem
   * @returns {void}
   */
  const finishEditItem = () => isEditingModeOn = false;

  /**
   * Выпуск события удаления элемента
   * @function deleteItem
   * @returns {void}
   */
  const deleteItem = () => ondelete(item);
</script>

{#if isSkeleton}
  <div class="card bg-base-100 md:shadow-xl">
    <div class="card-body prose">
      <h2 class="skeleton card-title">&nbsp;</h2>
      <p>
        <span class="skeleton mb-px block">&nbsp;</span>
        <span class="skeleton mb-px block">&nbsp;</span>
        <span class="skeleton mb-px block">&nbsp;</span>
        <span class="skeleton mb-px block">&nbsp;</span>
      </p>
      <div class="card-actions">
        <div class="skeleton btn w-full md:flex-1">&nbsp;</div>
        <div class="skeleton btn w-full md:flex-1">&nbsp;</div>
      </div>
    </div>
  </div>
{:else}
  <div
    class="card bg-base-100 md:shadow-xl"
    class:cursor-grab={isReorderModeOn}
    class:select-none={isReorderModeOn}
    data-id={item.id}
  >
    <div class="card-body prose">
      {#if isEditingModeOn && !isReorderModeOn}
        <ItemForm {values} {item} onfinish={finishEditItem} />
      {:else}
        <h3 class="card-title" class:mb-0={isReorderModeOn}>
          {#if isReorderModeOn}
            <GripVertical class="text-base-content/50" />
          {/if}
          {item.name}
        </h3>
        {#if !isReorderModeOn}
          <div bind:this={description} class="prose">
            <TelegramEntitiesParser
              text={item.description}
              entities={item.descriptionEntities ?? []}
            />
          </div>
          {#if item.category.id}
            <div class="flex items-center">
              <LayoutGrid class="w-4 h-4 mr-2" />
              {item.category.name}
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
