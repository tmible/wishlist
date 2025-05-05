<!-- @component Диалог с категориями -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import { Dialog } from 'bits-ui';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Save from 'lucide-svelte/icons/save';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Undo2 from 'lucide-svelte/icons/undo-2';
  import X from 'lucide-svelte/icons/x';
  import { categories } from './store.js';
  import { createCategory } from './use-cases/create-category.js';
  import { deleteCategory as deleteCategoryUseCase } from './use-cases/delete-category.js';
  import { editCategory as editCategoryUseCase } from './use-cases/edit-category.js';

  /** @typedef {import('./domain.js').Category} Category */

  /**
   * @typedef {object} Props
   * @property {boolean} [open] Признак открытости диалога
   */

  /** @type {Props} */
  let { open = $bindable(false) } = $props();

  /**
   * Ссылка на элемент с содержимым диалога
   * @type {HTMLElement}
   */
  let content = $state(null);

  /**
   * Значение инпута ввода названия новой категории
   * @type {string | null}
   */
  let newCategoryName = $state(null);

  /**
   * Редактируемая категория
   * @type {Category | null}
   */
  let editingCategory = $state(null);

  /**
   * Инпут ввода названия редактируемой категории. Используется для установки фокуса
   * @type {HTMLInputElement}
   */
  let editingCategoryInput = $state(null);

  /**
   * Обработчк изменения открытости диалога. Сбрасывает состояние при закрытии диалога
   * @type {(open: boolean) => void}
   */
  const onOpenChange = (isOpen) => {
    if (isOpen) {
      return;
    }
    newCategoryName = null;
    editingCategory = null;
    editingCategoryInput = null;
  };

  /**
   * Добавление новой категории
   * @function addCategory
   * @returns {Promise<void>}
   * @async
   */
  const addCategory = async () => {
    const tmp = newCategoryName;
    newCategoryName = null;
    await createCategory({ name: tmp });
  };

  /**
   * Отмена редактирования категории
   * @function cancelEditingCategory
   * @returns {void}
   */
  const cancelEditingCategory = () => {
    editingCategory = null;
  };

  /**
   * Сохранение отредактированной категории
   * @function submitEditedCategory
   * @param {Category} category Редактируемая категория в начальном варианте
   * @returns {Promise<void>}
   * @async
   */
  const submitEditedCategory = async (category) => {
    const tmp = editingCategory;
    editingCategory = null;
    await editCategoryUseCase(category, tmp);
  };

  /**
   * Начало редактирования категории
   * @param {Category} category Редактируемвая категория
   * @returns {void}
   */
  const editCategory = (category) => {
    editingCategory = { ...category };
    setTimeout(() => editingCategoryInput.focus());
  };

  /**
   * Удаление категории
   * @param {Category} category Удаляемая категория
   * @returns {Promise<void>}
   * @async
   */
  const deleteCategory = async (category) => {
    await deleteCategoryUseCase(category);
  };
</script>

<Dialog.Root {onOpenChange} bind:open={open}>
  <Dialog.Trigger class="hidden" />
  <Dialog.Portal to="#modal-portal">
    <Dialog.Overlay class="modal-backdrop" />
    <Dialog.Content
      class="modal-box overflow-y-visible p-0"
      onOpenAutoFocus={() => setTimeout(() => content.focus())}
      bind:ref={content}
    >
      <ScrollArea class="max-h-[inherit]" viewportClasses="max-h-[inherit] p-6">
        <div class="flex items-start prose mb-3">
          <Dialog.Title class="mt-0 mr-auto">Категории</Dialog.Title>
          <Dialog.Close class="cursor-pointer">
            <X />
          </Dialog.Close>
        </div>
        <div class="flex items-center gap-4 mb-3">
          <input
            class="input w-full bg-base-200"
            type="text"
            placeholder="Новая категория"
            bind:value={newCategoryName}
          >
          <button
            class="btn btn-primary"
            class:btn-disabled={!newCategoryName}
            disabled={!newCategoryName}
            onclick={addCategory}
          >
            Добавить
          </button>
        </div>
        <div class="flex flex-col">
          {#each $categories as category (category.id)}
            <div
              class="flex items-center justify-between rounded-lg"
              class:hover:bg-base-200={editingCategory?.id !== category.id}
              class:pl-4={editingCategory?.id !== category.id}
            >
              {#if editingCategory?.id === category.id}
                <input
                  bind:this={editingCategoryInput}
                  class="input grow bg-base-200"
                  type="text"
                  placeholder={category.name}
                  bind:value={editingCategory.name}
                >
                <div>
                  <button
                    class="btn btn-ghost"
                    data-testid="cancel-button"
                    onclick={cancelEditingCategory}
                  >
                    <Undo2 />
                  </button>
                  <button
                    class="btn btn-ghost"
                    data-testid="submit-button"
                    onclick={() => submitEditedCategory(category)}
                  >
                    <Save />
                  </button>
                </div>
              {:else}
                {category.name}
                <div>
                  <button
                    class="btn btn-ghost"
                    data-testid="edit-button"
                    onclick={() => editCategory(category)}
                  >
                    <Pencil />
                  </button>
                  <button
                    class="btn btn-ghost"
                    data-testid="delete-button"
                    onclick={() => deleteCategory(category)}
                  >
                    <Trash2 />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
