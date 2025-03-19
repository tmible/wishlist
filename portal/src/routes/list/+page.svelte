<!-- Svelte компонент -- страница со списком, главная страница авторизованной зоны -->
<script>
  import * as Sortable from 'sortablejs';
  import { goto } from '$app/navigation';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';
  import CategoriesDialog from './categories-dialog.svelte';
  import ListItemAddDialog from './list-item-add-dialog.svelte';
  import ListItemCard from './list-item-card.svelte';
  import ListItemDeleteAlert from './list-item-delete-alert.svelte';
  import Menu from './menu.svelte';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

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
   * @type {OwnListItem}
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
   * Запрос списка желаний пользователя и запись результата в [хранилище]{@link list}
   * @function requestList
   * @returns {Promise<void>}
   * @async
   */
  const requestList = async () => {
    const response = await fetch('/api/wishlist');
    list.set(await response.json());
  };

  /**
   * Открытие диалога с подтверждением удаления элемента списка
   * @function deleteListItem
   * @param {OwnListItem} item Удаляемый элемента списка
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
   * Подтверждение порядка элементов списка и выход из режима переупорядочивания
   * @function commitOrder
   * @returns {Promise<void>}
   * @async
   */
  const commitOrder = async () => {
    const patch = sortable
      .toArray()
      .map((id) => Number.parseInt(id))
      .map((reorderedId, i) => [ reorderedId !== $list[i].id, reorderedId, i ])
      .filter(([ isChanged ]) => isChanged)
      .map(([ , id, order ]) => ({ id, order }));

    isReorderModeOn = false;
    sortable.destroy();

    if (patch.length === 0) {
      return;
    }

    await fetch(
      '/api/wishlist',
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      },
    );

    list.update(
      (value) => value
        .map((listItem) => {
          const reorder = patch.find(({ id }) => id === listItem.id);
          return {
            ...listItem,
            order: reorder?.order ?? listItem.order,
          };
        })
        .sort((a, b) => a.order - b.order),
    );
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
</script>

{#if $user.isAuthenticated}
  <div class="bg-[url('/bg.svg')] bg-no-repeat bg-cover bg-base-200">
    <div class="w-full h-full min-h-dvh flex flex-col dark:backdrop-brightness-75">
      <div class="navbar">
        <div class="pl-12 md:pl-24 mr-auto relative self-start">
          <a href="https://t.me/tmible" target="_blank">
            <div class="absolute top-[-0.5rem] p-2 bg-[#ffd1dc]" data-theme="light">
              tmible
            </div>
          </a>
        </div>
        <div class="mr-4">
          <ThemeSwitcher />
        </div>
      </div>
      <div
        id="list"
        class="flex flex-col gap-4 pt-6 pb-24 md:pt-12 mx-6 lg:w-1/3 lg:mx-auto"
        class:md:pb-6={!isReorderModeOn}
      >
        <!-- eslint-disable-next-line unicorn/prefer-top-level-await -->
        {#await requestList()}
          {#each [ 1, 2, 3, 4 ] as index (index)}
            <ListItemCard isSkeleton={true} />
          {/each}
        {:then}
          {#if $list.length === 0}
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
            {#each $list as listItem (listItem.id)}
              <ListItemCard
                {listItem}
                {isReorderModeOn}
                ondelete={deleteListItem}
                refreshlist={requestList}
              />
            {/each}
          {/if}
        {/await}
      </div>
    </div>
    <Menu
      isMenuHidden={isReorderModeOn}
      add={openAddDialog}
      {reorder}
      clear={gotoClear}
      manageCategories={openCategoriesDialog}
    />
    <div
      class="fixed bottom-0 left-1/2 translate-x-[-50%] transition-transform shadow-xl"
      class:mb-6={isReorderModeOn}
      class:translate-y-[100%]={!isReorderModeOn}
    >
      <button
        class="btn btn-primary btn-lg"
        onclick={commitOrder}
      >
        Сохранить
      </button>
    </div>
  </div>

  <ListItemAddDialog
    add={requestList}
    bind:open={isAddDialogOpen}
  />

  <CategoriesDialog bind:open={isCategoriesDialogOpen} />

  <ListItemDeleteAlert
    {listItemToDelete}
    ondelete={requestList}
    bind:open={isDeletionBeingConfirmed}
  />
{/if}
