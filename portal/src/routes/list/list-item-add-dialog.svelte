<!-- Svelte компонент -- диалог с формой для добавления нового элемента списка -->
<script>
  import { Dialog } from 'bits-ui';
  import X from 'lucide-svelte/icons/x';
  import ScrollArea from '$lib/components/scroll-area.svelte';
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
  <Dialog.Portal to="#modal-portal">
    <Dialog.Overlay class="modal-backdrop" />
    <Dialog.Content class="modal-box overflow-y-visible p-0" interactOutsideBehavior="close">
      <ScrollArea class="max-h-[inherit]" viewportClasses="max-h-[inherit] p-6">
        <div class="flex items-start prose">
          <Dialog.Title class="mt-0 mr-auto">Добавить желание</Dialog.Title>
          <Dialog.Close class="cursor-pointer">
            <X />
          </Dialog.Close>
        </div>
        <ListItemForm cancel={close} success={dispatchAndClose} />
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
