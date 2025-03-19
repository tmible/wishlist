<!-- Svelte компонент -- диалог с формой для добавления нового элемента списка -->
<script>
  import { Dialog } from 'bits-ui';
  import X from 'lucide-svelte/icons/x';
  import ListItemForm from './list-item-form.svelte';

  /**
   * @typedef {object} Props
   * @property {boolean} [open] Признак открытости диалога
   * @property {() => void} add Функция обратного вызова для добавления элемента в список
   */

  /** @type {Props} */
  // eslint-disable-next-line prefer-const -- Нельзя разорвать определение $props
  let { open = $bindable(false), add } = $props();

  /**
   * Закрытие диалога
   * @function close
   * @returns {void}
   */
  const close = () => open = false;

  /**
   * Закрытие диалога и выпуск события успешного добавления
   * @function dispatchAndClose
   * @returns {void}
   */
  const dispatchAndClose = () => {
    open = false;
    add();
  };
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Trigger class="hidden" />
  <Dialog.Portal>
    <Dialog.Overlay class="modal-overlay" />
    <Dialog.Content class="modal-box p-0">
      <div class="overflow-y-auto p-6">
        <div class="flex items-start prose">
          <Dialog.Title class="mt-0 mr-auto">Добавить желание</Dialog.Title>
          <Dialog.Close>
            <X />
          </Dialog.Close>
        </div>
        <ListItemForm cancel={close} success={dispatchAndClose} />
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
