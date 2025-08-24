<!-- @component Страница со списком желаний, главная страница авторизованной зоны -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import * as Sortable from 'sortablejs';
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import CategoriesDialog from '$lib/categories/dialog.svelte';
  import Header from '$lib/components/header.svelte';
  import ModalPortal from '$lib/components/modal-portal.svelte';
  import WishlistExternalItemsDeleteAlert from '$lib/wishlist/components/external-items-delete-alert.svelte';
  import WishlistItemAddDialog from '$lib/wishlist/components/item-add-dialog.svelte';
  import WishlistItemCard from '$lib/wishlist/components/item-card.svelte';
  import WishlistItemDeleteAlert from '$lib/wishlist/components/item-delete-alert.svelte';
  import { wishlist } from '$lib/wishlist/store.js';
  import { reorderList } from '$lib/wishlist/use-cases/reorder-list.js';
  import Menu from './menu.svelte';

  /** @typedef {import('$lib/wishlist/domain.js').OwnWishlistItem} OwnWishlistItem */

  /**
   * Признак открытости диалога добавления нового элемента списка
   * @type {boolean}
   */
  let isAddDialogOpen = $state(false);

  /**
   * Признак удаления элемента списка. Фактически признак
   * открытости диалога с подтверждением удаления
   * @type {boolean}
   */
  let isDeletionBeingConfirmed = $state(false);

  /**
   * Удаляемый элемент списка
   * @type {OwnWishlistItem}
   */
  let listItemToDelete = $state();

  /**
   * Признак активности режима переупорядочивания списка
   * @type {boolean}
   */
  let isReorderModeOn = $state(false);

  /**
   * Объект управления сортировкой списка перетаскиванием
   * @type {Sortable}
   */
  let sortable;

  /**
   * Признак открытости диалога управления категориями
   * @type {boolean}
   */
  let isCategoriesDialogOpen = $state(false);

  /**
   * Признак наличия сюрпризов в списке желаний
   * @type {boolean}
   */
  const hasExternalItems = $derived($wishlist.some(({ isExternal }) => isExternal));

  /**
   * Признак удаления всех сюрпризов из списка желаний.
   * Фактически признак открытости диалога с подтверждением
   * @type {boolean}
   */
  let isExternalItemsDeletionBeingConfirmed = $state(false);

  /**
   * Открытие диалога с подтверждением удаления элемента списка
   * @function deleteListItem
   * @param {OwnWishlistItem} item Удаляемый элемента списка
   * @returns {void}
   */
  const deleteListItem = (item) => {
    isDeletionBeingConfirmed = true;
    listItemToDelete = item;
  };

  /**
   * Открытие диалога добавления нового элемента списка
   * @function openAddDialog
   * @returns {void}
   */
  const openAddDialog = () => isAddDialogOpen = true;

  /**
   * Переход в режим переупорядочивания списка
   * @function reorder
   * @returns {void}
   */
  const reorder = () => {
    isReorderModeOn = true;
    sortable = Sortable.Sortable.create(
      document.querySelector('#list'),
      {
        delay: 250,
        delayOnTouchOnly: true,
        forceFallback: true,
        fallbackOnBody: true,
        scrollSensitivity: 100,
        scrollSpeed: 20,
      },
    );
  };

  /**
   * Выход из режима переупорядочивания списка без изменения порядка
   * @function cancelReorder
   * @returns {void}
   */
  const cancelReorder = () => {
    sortable.sort($wishlist.map(({ id }) => id), false);
    sortable.destroy();
    isReorderModeOn = false;
  };

  /**
   * Подтверждение порядка элементов списка и выход из режима переупорядочивания
   * @function commitOrder
   * @returns {Promise<void>}
   * @async
   */
  const commitOrder = async () => {
    const patch = sortable
      .toArray()
      .map((id) => Number.parseInt(id))
      .map((reorderedId, i) => [ reorderedId !== $wishlist[i].id, reorderedId, i ])
      .filter(([ isChanged ]) => isChanged)
      .map(([ , id, order ]) => ({ id, order }));

    isReorderModeOn = false;
    sortable.destroy();

    await reorderList(patch);
  };

  /**
   * Навигация на страницу быстрой очистки списка
   * @function gotoClear
   * @returns {Promise<void>}
   */
  const gotoClear = () => goto('/list/clear');

  /**
   * Открытие диалога управления категориями
   * @function openCategoriesDialog
   * @returns {void}
   */
  const openCategoriesDialog = () => {
    isCategoriesDialogOpen = true;
  };

  /**
   * Открытие диалога с подтверждением удаления всех сюрпризов из списка желаний
   * @function deleteAllExternalItems
   * @returns {void}
   */
  const deleteAllExternalItems = () => {
    isExternalItemsDeletionBeingConfirmed = true;
  };
</script>

<ScrollArea viewportClasses="w-full h-full max-h-dvh flex flex-col">
  <Header />
  <main
    id="list"
    class="flex flex-col gap-4 pt-6 pb-24 md:pt-12 mx-6 lg:w-1/3 lg:mx-auto"
    class:md:pb-6={!isReorderModeOn}
  >
    {#await getContext('get wishlist promise')}
      {#each [ 1, 2, 3, 4 ] as index (index)}
        <WishlistItemCard isSkeleton={true} />
      {/each}
    {:then}
      {#if $wishlist.length === 0}
        <div class="card bg-base-100 md:shadow-xl">
          <div class="card-body prose">
            <h3 class="card-title">Ваш список пуст</h3>
            <p>Добавьте в&nbsp;него свои желания</p>
            <button class="btn btn-primary" onclick={openAddDialog}>
              Добавить
            </button>
          </div>
        </div>
      {:else}
        {#each $wishlist.filter(({ isExternal }) => !isExternal) as item (item.id)}
          <WishlistItemCard {item} {isReorderModeOn} ondelete={deleteListItem} />
        {/each}
        {#if hasExternalItems}
          <div class="card bg-base-100 md:shadow-xl">
            <div class="card-body prose">
              <h3 class="card-title">В вашем списке есть сюрпризы</h3>
              <p>
                Кто-то добавил один или несколько подарков в ваш список желаний.
                Скорее всего, это значит, что вам хотят сделать сюрприз.
                Вы можете удалить все такие подарки
              </p>
              <button class="btn btn-outline btn-error" onclick={deleteAllExternalItems}>
                Удалить все сюрпризы
              </button>
            </div>
          </div>
        {/if}
      {/if}
    {/await}
  </main>
  <Menu
    isMenuHidden={isReorderModeOn}
    add={openAddDialog}
    {reorder}
    clear={gotoClear}
    manageCategories={openCategoriesDialog}
  />
  <div
    class="fixed bottom-0 left-1/2 translate-x-[-50%] transition-transform w-max"
    class:mb-6={isReorderModeOn}
    class:translate-y-[100%]={!isReorderModeOn}
    class:invisible={!isReorderModeOn}
  >
    <button class="btn btn-neutral btn-lg mr-6 shadow-xl" onclick={cancelReorder}>
      Отменить
    </button>
    <button
      class="btn btn-primary btn-lg shadow-xl elegant:border-primary-content"
      onclick={commitOrder}
    >
      Сохранить
    </button>
  </div>
</ScrollArea>

<ModalPortal />

<WishlistItemAddDialog bind:open={isAddDialogOpen} />

<CategoriesDialog bind:open={isCategoriesDialogOpen} />

<WishlistItemDeleteAlert {listItemToDelete} bind:open={isDeletionBeingConfirmed} />

<WishlistExternalItemsDeleteAlert bind:open={isExternalItemsDeletionBeingConfirmed} />
