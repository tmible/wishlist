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

<Dialog.Root bind:open>
  <Dialog.Trigger class="hidden" />
  <div class="modal" {...(open ? { open: '' } : {})}>
    <Dialog.Overlay class="modal-backdrop" />
    <Dialog.Content class="modal-box overflow-y-auto p-6" interactOutsideBehavior="close">
      <div class="flex items-start prose">
        <Dialog.Title class="mt-0 mr-auto">Добавить желание</Dialog.Title>
        <Dialog.Close>
          <X />
        </Dialog.Close>
      </div>
      <ListItemForm cancel={close} success={dispatchAndClose} />
    </Dialog.Content>
  </div>
</Dialog.Root>
