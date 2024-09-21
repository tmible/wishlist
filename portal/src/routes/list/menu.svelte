<!-- Svelte компонент -- меню портала -->
<script>
  import { post } from '@tmible/wishlist-common/post';
  import Bot from 'lucide-svelte/icons/bot';
  import Eraser from 'lucide-svelte/icons/eraser';
  import LayoutGrid from 'lucide-svelte/icons/layout-grid';
  import Link from 'lucide-svelte/icons/link';
  import LogOut from 'lucide-svelte/icons/log-out';
  import Plus from 'lucide-svelte/icons/plus';
  import User from 'lucide-svelte/icons/user';
  import Users from 'lucide-svelte/icons/users';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';
  import DesktopMenu from './desktop-menu.svelte';
  import LayoutListMove from './layout-list-move.svelte';
  import MobileMenu from './mobile-menu.svelte';

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
   * Признак необходимости спрятать меню
   * @type {boolean}
   */
  export let isMenuHidden = false;

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
  $: options = [{
    icon: Plus,
    label: 'Добавить',
    testId: 'add',
    onClick: () => dispatch('add'),
  }, {
    icon: LayoutListMove,
    label: 'Изменить порядок',
    testId: 'reorder',
    onClick: () => dispatch('reorder'),
    condition: ($list ?? []).length > 0,
  }, {
    icon: Eraser,
    label: 'Быстрая очистка',
    testId: 'clear',
    onClick: () => dispatch('clear'),
    condition: ($list ?? []).length > 0,
  }, {
    icon: LayoutGrid,
    label: 'Управлять категориями',
    testId: 'categories',
    onClick: () => dispatch('manageCategories'),
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

<MobileMenu {isMenuHidden} {options} />
<DesktopMenu {isMenuHidden} {options} />
