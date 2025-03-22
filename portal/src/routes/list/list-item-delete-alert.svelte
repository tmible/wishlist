<!-- Svelte компонент -- диалог с подтверждением удаления элемента списка -->
<script>
  import { AlertDialog } from 'bits-ui';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * @typedef {object} Props
   * @property {OwnListItem} listItemToDelete Удаляемый элемент
   * @property {boolean} open Признак открытости диалога
   * @property {() => void} ondelete Функция обратного вызова для удаления элемента
   */

  /** @type {Props} */
  // eslint-disable-next-line prefer-const -- Нельзя разорвать определение $props
  let { open = $bindable(), listItemToDelete, ondelete } = $props();

  /**
   * Удаление элемента списка и выпуск события обновления списка
   * @function deleteListItem
   * @returns {Promise<void>}
   * @async
   */
  const deleteListItem = async () => {
    open = false;
    await fetch(
      '/api/wishlist',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify([ listItemToDelete.id ]),
      },
    );
    ondelete();
  };
</script>

<AlertDialog.Root bind:open={open}>
  <AlertDialog.Trigger class="hidden" />
  <div class="modal" {...(open ? { open: '' } : {})}>
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
  </div>
</AlertDialog.Root>
