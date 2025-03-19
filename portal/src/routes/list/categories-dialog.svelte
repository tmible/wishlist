<!-- Svelte компонент -- диалог с категориями -->
<script>
  import { Dialog } from 'bits-ui';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Save from 'lucide-svelte/icons/save';
  import Trash2 from 'lucide-svelte/icons/trash-2';
  import Undo2 from 'lucide-svelte/icons/undo-2';
  import X from 'lucide-svelte/icons/x';
  import { categories } from '$lib/store/categories.js';

  /** @typedef {import('$lib/store/categories.js').Category} Category */

  /**
   * @typedef {object} Props
   * @property {boolean} [open] Признак открытости диалога
   */

  /** @type {Props} */
  let { open = $bindable(false) } = $props();

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
   * Обновление категорий
   * @function refreshCategories
   * @returns {Promise<void>}
   * @async
   */
  const refreshCategories = async () => {
    const response = await fetch('/api/wishlist/categories');
    categories.set(await response.json());
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
    await fetch('/api/wishlist/categories', { method: 'POST', body: tmp });
    await refreshCategories();
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
   * @param {string} name Новое название категории
   * @returns {Promise<void>}
   * @async
   */
  const submitEditedCategory = async (name) => {
    if (editingCategory.name === name) {
      editingCategory = null;
      return;
    }
    const tmp = { ...editingCategory };
    editingCategory = null;
    await fetch(
      `/api/wishlist/categories/${tmp.id}`,
      { method: 'PUT', body: tmp.name },
    );
    await refreshCategories();
  };

  /**
   * Начало редактирования категории
   * @param {number} id Идентификатор категории
   * @param {string} name Название категории
   * @returns {void}
   */
  const editCategory = (id, name) => {
    editingCategory = { id, name };
    setTimeout(() => editingCategoryInput.focus());
  };

  /**
   * Удаление категории
   * @param {number} id Идентификатор категории
   * @returns {Promise<void>}
   * @async
   */
  const deleteCategory = async (id) => {
    await fetch(`/api/wishlist/categories/${id}`, { method: 'DELETE' });
    await refreshCategories();
  };
</script>

<Dialog.Root {onOpenChange} bind:open={open}>
  <Dialog.Trigger class="hidden" />
  <Dialog.Portal>
    <Dialog.Overlay class="modal-overlay" />
    <Dialog.Content class="modal-box p-0">
      <div class="overflow-y-auto p-6">
        <div class="flex items-start prose">
          <Dialog.Title class="mt-0 mr-auto">Категории</Dialog.Title>
          <Dialog.Close>
            <X />
          </Dialog.Close>
        </div>
        <div class="flex items-center gap-4 mb-6">
          <input
            class="input input-bordered w-full bg-base-200"
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
          {#each $categories as { id, name } (id)}
            <div
              class="flex items-center justify-between rounded-lg"
              class:hover:bg-base-200={editingCategory?.id !== id}
              class:pl-4={editingCategory?.id !== id}
            >
              {#if editingCategory?.id === id}
                <input
                  bind:this={editingCategoryInput}
                  class="input input-bordered flex-grow bg-base-200"
                  type="text"
                  placeholder={name}
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
                    onclick={() => submitEditedCategory(name)}
                  >
                    <Save />
                  </button>
                </div>
              {:else}
                {name}
                <div>
                  <button
                    class="btn btn-ghost"
                    data-testid="edit-button"
                    onclick={() => editCategory(id, name)}
                  >
                    <Pencil />
                  </button>
                  <button
                    class="btn btn-ghost"
                    data-testid="delete-button"
                    onclick={() => deleteCategory(id)}
                  >
                    <Trash2 />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
