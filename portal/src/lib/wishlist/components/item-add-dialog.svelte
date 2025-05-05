<!-- @component Диалог с формой для добавления нового элемента списка -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import { Dialog } from 'bits-ui';
  import X from 'lucide-svelte/icons/x';
  import ItemForm from './item-form.svelte';

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
   * Закрытие диалога
   * @function close
   * @returns {void}
   */
  const close = () => open = false;
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class="hidden" />
  <Dialog.Portal to="#modal-portal">
    <Dialog.Overlay class="modal-backdrop" />
    <Dialog.Content
      class="modal-box overflow-y-visible p-0"
      interactOutsideBehavior="close"
      onOpenAutoFocus={() => setTimeout(() => content.focus())}
      bind:ref={content}
    >
      <ScrollArea class="max-h-[inherit]" viewportClasses="max-h-[inherit] p-6">
        <div class="flex items-start prose">
          <Dialog.Title class="mt-0 mr-auto">Добавить желание</Dialog.Title>
          <Dialog.Close class="cursor-pointer">
            <X />
          </Dialog.Close>
        </div>
        <ItemForm onfinish={close} />
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
