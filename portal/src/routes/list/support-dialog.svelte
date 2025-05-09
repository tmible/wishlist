<!-- @component Диалог сообщения в поддержку -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import { Dialog } from 'bits-ui';
  import X from 'lucide-svelte/icons/x';
  import { onDestroy } from 'svelte';
  import initSupportFeature from '$lib/support/initialization.js';
  import messageSupportUseCase from '$lib/support/use-cases/message.js';

  /**
   * @typedef {object} Props
   * @property {boolean} [open] Признак открытости диалога
   */

  /** @type {Props} */
  let { open = $bindable(false) } = $props();

  /**
   * Регистрация зависисмостей для работы со списком желаний
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroySupportFeature = initSupportFeature();

  /**
   * Ссылка на элемент с содержимым диалога
   * @type {HTMLElement}
   */
  let content = $state(null);

  /**
   * Сообщение в поддержку
   * @type {string | null}
   */
  let message = $state(null);

  let messageDelivery = $state(null);

  let cancelMessageWaiting;

  /**
   * Добавление новой категории
   * @function addCategory
   * @returns {void}
   */
  const messageSupport = async () => {
    [ messageDelivery, cancelMessageWaiting ] = await messageSupportUseCase(message);
    const status = await messageDelivery.finally(() => messageDelivery = null);
    if (status === 'success') {
      open = false;
    }
  };

  const onOpenChange = (open) => {
    if (!open) {
      messageDelivery = null;
      cancelMessageWaiting?.();
    }
  };

  onDestroy(() => {
    destroySupportFeature();
  });
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
      <ScrollArea class="h-full max-h-[inherit]" viewportClasses="h-full max-h-[inherit] p-6">
        <div class="flex flex-col h-full">
          <div class="flex items-start prose mb-3">
            <Dialog.Title>
              {#snippet child({ props })}
                <h2 class="mb-0 mr-auto" {...props}>
                  Поддержка
                </h2>
              {/snippet}
            </Dialog.Title>
            <Dialog.Close class="cursor-pointer">
              <X />
            </Dialog.Close>
          </div>
          <div class="grow-1">
            <Dialog.Description>
              {#snippet child({ props })}
                <p class="prose mb-2" {...props}>
                  Здесь вы&nbsp;можете написать сообщение в&nbsp;поддержу. Сообщения
                  об&nbsp;ошибках, отзывы и&nbsp;пожелания горячо приветствуются!
                  <br>
                  Если вы&nbsp;хотите добавить в&nbsp;сообщение что-либо, кроме текста, пожалуйста,
                  используйте команду <span class="underline">/support</span>
                  <span class="whitespace-nowrap">
                    в
                    <a
                      class="whitespace-normal"
                      href="https://t.me/tmible_wishlist_bot"
                      target="_blank"
                    >
                      боте
                    </a>
                  </span>
                </p>
              {/snippet}
            </Dialog.Description>
            <textarea
              class="textarea mb-6 w-full h-24 bg-base-200 overflow-y-auto resize-y"
              placeholder="Сообщение в поддержку"
              bind:value={message}
            ></textarea>
          </div>
          <div class="flex flex-wrap gap-2">
            <Dialog.Close>
              {#snippet child({ props })}
                <button class="btn btn-neutral w-full md:flex-1" {...props}>
                  Отмена
                </button>
              {/snippet}
            </Dialog.Close>
            <button
              class="btn btn-primary w-full md:flex-1"
              class:btn-disabled={!message || !!messageDelivery}
              disabled={!message || !!messageDelivery}
              onclick={messageSupport}
            >
              {#await messageDelivery}
                <span class="loading loading-spinner"></span>
              {:then}
                Отправить
              {:catch}
                Отправить
              {/await}
            </button>
          </div>
        </div>
      </ScrollArea>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
