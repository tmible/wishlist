<!-- Svelte компонент -- меню портала -->
<script>
  import { post } from '@tmible/wishlist-common/post';
  import { DropdownMenu } from 'bits-ui';
  import Bot from 'lucide-svelte/icons/bot';
  import Ellipsis from 'lucide-svelte/icons/ellipsis';
  import Eraser from 'lucide-svelte/icons/eraser';
  import Link from 'lucide-svelte/icons/link';
  import LogOut from 'lucide-svelte/icons/log-out';
  import Plus from 'lucide-svelte/icons/plus';
  import User from 'lucide-svelte/icons/user';
  import Users from 'lucide-svelte/icons/users';
  import { createEventDispatcher } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';

  /** @typedef {import('svelte').ComponentType} ComponentType */

  /**
   * Общие свойства для всех типов пунктов меню
   * @typedef {object} MenuItemBase
   * @property {ComponentType} icon Иконка
   * @property {string} label Название
   * @property {string} testId Идентификатор для тестов
   * @property {boolean} [condition] Условие, при выполнении которого пункт меню отображается
   */

  /**
   * Пункт меню без дочерних пунктов
   * @typedef {object} MenuItemInteractive
   * @property {(event: Event) => void | Promise<void>} onClick Обработчик клика по пункту меню
   * @augments MenuItemBase
   */

  /**
   * Пункт меню с дочернми пунктами
   * @typedef {object} MenuItemWithChildren
   * @property {MenuItem[]} children Дочерние пунткы меню
   * @augments MenuItemBase
   */

  /** @typedef {MenuItemInteractive | MenuItemWithChildren} MenuItem */

  /**
   * Диспетчер событий
   * @type {import('svelte').EventDispatcher}
   */
  const dispatch = createEventDispatcher();

  /**
   * Фунция svelte transition
   * @function flyAndScale
   * @returns {import('svelte/transition').TransitionConfig} Параметры transition
   * @see {@link https://svelte.dev/docs/svelte-transition}
   */
  const flyAndScale = () => ({
    duration: 100,
    easing: cubicOut,
    css: (t, u) => `opacity: ${t}; transform: translateY(${u * 25}%)`,
  });

  /**
   * Формирование ссылки на список пользователя в диалоге с ботом или для групп, в которых есть бот.
   * По возможности вызов меню "Поделиться", иначе копирование ссылки в буфер обмена и индикация
   * в интерфейсе
   * @function shareLink
   * @param {Event} event Событие клика по кнопке получения ссылки
   * @param {boolean} isLinkForGroups Признак необходимости формирования ссылки для групп
   * @returns {void}
   * @async
   */
  const shareLink = async (event, isLinkForGroups) => {
    const link = `https://t.me/tmible_wishlist_bot?start${
      isLinkForGroups ? 'group' : ''
    }=${$user.id}`;
    if (navigator.share) {
      await navigator.share({ url: link });
      return;
    }
    await navigator.clipboard.writeText(link);
    event.detail.currentTarget.classList.add('clicked', 'relative');
    setTimeout(() => event.detail.currentTarget.classList.remove('clicked', 'relative'), 1000);
  };

  /**
   * Пункты меню
   * @type {MenuItem[]}
   */
  $: menu = [{
    icon: Plus,
    label: 'Добавить',
    testId: 'add',
    onClick: () => dispatch('add'),
  }, {
    icon: Eraser,
    label: 'Быстрая очистка',
    testId: 'clear',
    onClick: () => dispatch('clear'),
    condition: ($list ?? []).length > 0,
  }, {
    icon: Link,
    label: 'Поделиться',
    testId: 'share',
    children: [{
      icon: User,
      label: 'Ссылка на чат с ботом',
      testId: 'share-bot',
      onClick: (event) => shareLink(event, false),
    }, {
      icon: Users,
      label: 'Ссылка для групп',
      testId: 'share-group',
      onClick: (event) => shareLink(event, true),
    }],
  }, {
    icon: Bot,
    label: 'Перейти к боту',
    testId: 'to-bot',
    onClick: () => open('https://t.me/tmible_wishlist_bot', '_blank'),
  }, {
    icon: LogOut,
    label: 'Выйти',
    testId: 'logout',
    onClick: async () => {
      const response = await post('/api/logout');
      if (response.ok) {
        user.set({ id: null, isAuthenticated: false });
        goto('/');
      }
    },
  }];
</script>

<div class="fixed bottom-0 right-0 mr-6 mb-6 md:hidden">
  <DropdownMenu.Root preventScroll={false}>
    <DropdownMenu.Trigger class="btn btn-primary btn-circle">
      <Ellipsis />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      class="shadow-xl menu bg-base-300 rounded-box"
      side="top"
      sideOffset={16}
      strategy="fixed"
      align="end"
      transition={flyAndScale}
    >
      {#each menu as { icon, label, testId, children, onClick, condition = true } (label)}
        {#if condition}
          {#if children}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger data-testid={testId}>
                <li>
                  <span>
                    <svelte:component this={icon} class="w-5 h-5" />
                    {label}
                  </span>
                </li>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent
                class="shadow-xl menu bg-base-300 rounded-box"
                sideOffset={12}
                strategy="fixed"
                transition={flyAndScale}
                side="top"
              >
                {#each children as { icon, label, testId, onClick } (label)}
                  <DropdownMenu.Item data-testid={testId} on:click={onClick}>
                    <li>
                      <span>
                        <svelte:component this={icon} class="w-5 h-5" />
                        {label}
                      </span>
                    </li>
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          {:else}
            <DropdownMenu.Item data-testid={testId} on:click={onClick}>
              <li>
                <span>
                  <svelte:component this={icon} class="w-5 h-5" />
                  {label}
                </span>
              </li>
            </DropdownMenu.Item>
          {/if}
        {/if}
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

<div class="fixed bottom-0 mb-6 floating-menu hidden md:block">
  <ul class="shadow-xl menu bg-base-100 rounded-box">
    {#each menu as { icon, label, testId, children, onClick, condition = true } (label)}
      {#if condition}
        {#if children}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger data-testid={testId}>
              <li>
                <span>
                  <svelte:component this={icon} class="w-5 h-5" />
                  {label}
                </span>
              </li>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              class="shadow-xl menu bg-base-100 rounded-box"
              sideOffset={16}
              strategy="fixed"
              transition={flyAndScale}
              side="left"
            >
              {#each children as { icon, label, testId, onClick } (label)}
                <DropdownMenu.Item data-testid={testId} on:click={onClick}>
                  <li>
                    <span>
                      <svelte:component this={icon} class="w-5 h-5" />
                      {label}
                    </span>
                  </li>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {:else}
          <button data-testid={testId} on:click={onClick}>
            <li>
              <span>
                <svelte:component this={icon} class="w-5 h-5" />
                {label}
              </span>
            </li>
          </button>
        {/if}
      {/if}
    {/each}
  </ul>
</div>

<style>
  @keyframes success {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%);
    }
    50% {
      opacity: 0.75;
      transform: translate(-50%, -75%);
      }
    100% {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
  }

  :global(div[role="menuitem"].clicked)::before {
    content: 'скопировано';
    animation: 1s ease-out both success;
    @apply absolute;
    @apply top-0;
    left: 50%;
    @apply bg-success;
    @apply text-success-content;
    @apply py-0.5;
    @apply px-1;
    @apply rounded-full;
  }

  .floating-menu {
    right: calc(1.5rem + var(--scrollbar-width, 0px));
  }
</style>
