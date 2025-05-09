<!-- @component Меню портала -->
<script>
  import Bot from 'lucide-svelte/icons/bot';
  import Eraser from 'lucide-svelte/icons/eraser';
  import LayoutGrid from 'lucide-svelte/icons/layout-grid';
  import Link from 'lucide-svelte/icons/link';
  import LogOut from 'lucide-svelte/icons/log-out';
  import Plus from 'lucide-svelte/icons/plus';
  import User from 'lucide-svelte/icons/user';
  import Users from 'lucide-svelte/icons/users';
  import { logout } from '$lib/user/use-cases/logout.js';
  import { wishlist } from '$lib/wishlist/store.js';
  import { shareLink } from '$lib/wishlist/use-cases/share-link.js';
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
   * @typedef {object} Props
   * @property {boolean} [isMenuHidden] Признак необходимости спрятать меню
   * @property {() => void} add Функция обратного вызова для добавления элемента в список
   * @property {() => void} reorder
   *   Функция обратного вызова для изменения порядка элементов в списке
   * @property {() => void} clear Функция обратного вызова для перехода к очистке списка
   * @property {() => void} manageCategories Функция обратного вызова для управления категориями
   */

  /** @type {Props} */
  const {
    isMenuHidden = false,
    add,
    reorder,
    clear,
    manageCategories,
  } = $props();

  /**
   * Пункты меню
   * @type {MenuItem[]}
   */
  const options = $derived([{
    icon: Plus,
    label: 'Добавить',
    testId: 'add',
    onClick: add,
  }, {
    icon: LayoutListMove,
    label: 'Изменить порядок',
    testId: 'reorder',
    onClick: reorder,
    condition: ($wishlist ?? []).length > 0,
  }, {
    icon: Eraser,
    label: 'Быстрая очистка',
    testId: 'clear',
    onClick: clear,
    condition: ($wishlist ?? []).length > 0,
  }, {
    icon: LayoutGrid,
    label: 'Управлять категориями',
    testId: 'categories',
    onClick: manageCategories,
  }, {
    icon: Link,
    label: 'Поделиться',
    testId: 'share',
    children: [{
      icon: User,
      label: 'Ссылка на чат с ботом',
      testId: 'share-bot',
      onClick: (event, currentTarget) => shareLink(currentTarget, false),
    }, {
      icon: Users,
      label: 'Ссылка для групп',
      testId: 'share-group',
      onClick: (event, currentTarget) => shareLink(currentTarget, true),
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
    onClick: logout,
  }]);
</script>

<MobileMenu {isMenuHidden} {options} />
<DesktopMenu {isMenuHidden} {options} />
