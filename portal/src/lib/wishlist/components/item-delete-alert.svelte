<!-- @component Диалог с подтверждением удаления элемента списка -->
<script>
  import { AlertDialog } from 'bits-ui';
  import { deleteItem } from '../use-cases/delete-item.js';

  /** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * @typedef {object} Props
   * @property {OwnWishlistItem} listItemToDelete Удаляемый элемент
   * @property {boolean} open Признак открытости диалога
   */

  /** @type {Props} */
  // eslint-disable-next-line prefer-const -- Нельзя разорвать определение $props
  let { open = $bindable(), listItemToDelete } = $props();

  /**
   * Удаление элемента списка
   * @function deleteListItem
   * @returns {Promise<void>}
   * @async
   */
  const deleteListItem = async () => {
    open = false;
    await deleteItem(listItemToDelete);
  };
</script>

<AlertDialog.Root bind:open={open}>
  <AlertDialog.Trigger class="hidden" />
  <AlertDialog.Portal to="#modal-portal">
    <AlertDialog.Overlay class="modal-backdrop" />
    <AlertDialog.Content class="modal-box flex flex-col justify-center">
      <div class="contents prose">
        <AlertDialog.Title>Подвердите удаление</AlertDialog.Title>
        <AlertDialog.Description>
          {#snippet child({ props })}
            <p {...props}>
              Вы&nbsp;уверены, что хотите удалить желание «{listItemToDelete.name}» из списка?
            </p>
          {/snippet}
        </AlertDialog.Description>
        <div class="card-actions">
          <AlertDialog.Cancel class="btn btn-neutral flex-1">
            Отмена
          </AlertDialog.Cancel>
          <AlertDialog.Action class="btn btn-error flex-1" onclick={deleteListItem}>
            Удалить
          </AlertDialog.Action>
        </div>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
