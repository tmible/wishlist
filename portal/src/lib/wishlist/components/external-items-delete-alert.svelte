<!-- @component Диалог с подтверждением удаления всех сюрпризов -->
<script>
  import { AlertDialog } from 'bits-ui';
  import { wishlist } from '../store.js';
  import { deleteItems } from '../use-cases/delete-items.js';

  /** @typedef {import('../domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * @typedef {object} Props
   * @property {boolean} open Признак открытости диалога
   */

  /** @type {Props} */
  let { open = $bindable() } = $props();

  /**
   * Удаление всех сюрпризов
   * @function deleteAllExternalItems
   * @returns {Promise<void>}
   * @async
   */
  const deleteAllExternalItems = async () => {
    open = false;
    await deleteItems($wishlist.filter(({ isExternal }) => isExternal).map(({ id }) => id));
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
              Вы&nbsp;уверены, что хотите удалить все сюрпризы из списка?
            </p>
          {/snippet}
        </AlertDialog.Description>
        <div class="card-actions">
          <AlertDialog.Cancel class="btn btn-neutral flex-1">
            Отмена
          </AlertDialog.Cancel>
          <AlertDialog.Action class="btn btn-error flex-1" onclick={deleteAllExternalItems}>
            Удалить
          </AlertDialog.Action>
        </div>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
