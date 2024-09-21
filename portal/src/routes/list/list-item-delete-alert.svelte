<!-- Svelte компонент -- диалог с подтверждением удаления элемента списка -->
<script>
  import { AlertDialog } from 'bits-ui';
  import { createEventDispatcher } from 'svelte';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * Диспетчер событий
   * @type {import('svelte').EventDispatcher}
   */
  const dispatch = createEventDispatcher();

  /**
   * Удаляемый элемент
   * @type {OwnListItem}
   */
  export let listItemToDelete;

  /**
   * Признак открытости диалога
   * @type {boolean}
   */
  export let open;

  /**
   * Удаление элемента списка и выпуск события обновления списка
   * @function deleteListItem
   * @returns {Promise<void>}
   * @async
   */
  const deleteListItem = async () => {
    await fetch(
      '/api/wishlist',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify([ listItemToDelete.id ]),
      },
    );
    dispatch('delete');
  };
</script>

<AlertDialog.Root bind:open={open}>
  <AlertDialog.Trigger class="hidden" />
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="modal-overlay" />
    <AlertDialog.Content class="modal-box modal-alert">
      <div class="contents prose">
        <AlertDialog.Title>Подвердите удаление</AlertDialog.Title>
        <AlertDialog.Description asChild let:builder>
          <p use:builder.action {...builder}>
            Вы&nbsp;уверены, что хотите удалить желание «{listItemToDelete.name}» из списка?
          </p>
        </AlertDialog.Description>
        <div class="card-actions">
          <AlertDialog.Cancel class="btn btn-neutral flex-1">
            Отмена
          </AlertDialog.Cancel>
          <AlertDialog.Action class="btn btn-error flex-1" on:click={deleteListItem}>
            Удалить
          </AlertDialog.Action>
        </div>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
