<!-- Svelte компонент -- страница со списком, главная страница авторизованной зоны -->
<script>
  import { goto } from '$app/navigation';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { list } from '$lib/store/list';
  import { user } from '$lib/store/user';
  import ListItemAddDialog from './list-item-add-dialog.svelte';
  import ListItemCard from './list-item-card.svelte';
  import ListItemDeleteAlert from './list-item-delete-alert.svelte';
  import Menu from './menu.svelte';

  /** @typedef {import('$lib/store/list').OwnListItem} OwnListItem */

  /**
   * Признак открытости диалога добавления нового элемента списка
   * @type {boolean}
   */
  let isAddDialogOpen = false;

  /**
   * Признак удаления элемента списка. Фактически признак
   * открытости диалога с подтверждением удаления
   * @type {boolean}
   */
  let isDeletionBeingConfirmed = false;

  /**
   * Удаляемый элемент списка
   * @type {OwnListItem}
   */
  let listItemToDelete;

  /**
   * Запрос списка желаний пользователя и запись результата в [хранилище]{@link list}
   * @function requestList
   * @returns {Promise<void>}
   * @async
   */
  const requestList = async () => {
    const response = await fetch(`/api/wishlist?userid=${$user.id}`);
    list.set(await response.json());
  };

  /**
   * Открытие диалога с подтверждением удаления элемента списка
   * @function deleteListItem
   * @param {CustomEvent} event Событие удаления элемента списка из дочернего компонента
   * @param {OwnListItem} event.detail Удаляемый элемента списка
   * @returns {void}
   */
  const deleteListItem = ({ detail }) => {
    isDeletionBeingConfirmed = true;
    listItemToDelete = detail;
  };

  /**
   * Открытие диалога добавления нового элемента списка
   * @function openAddDialog
   * @returns {void}
   */
  const openAddDialog = () => isAddDialogOpen = true;

  /**
   * Навигация на страницу быстрой очистки списка
   * @function gotoClear
   * @returns {Promise<void>}
   */
  const gotoClear = () => goto('/list/clear');
</script>

{#if $user.isAuthenticated}
  <div class="bg-[url('/bg.svg')] bg-no-repeat bg-cover bg-base-200">
    <div class="w-full h-full min-h-dvh flex flex-col dark:backdrop-brightness-75">
      <div class="navbar">
        <div class="pl-12 md:pl-24 mr-auto relative self-start">
          <a href="https://t.me/tmible" target="_blank">
            <div class="absolute top-[-0.5rem] p-2 bg-[#ffd1dc]" data-theme="light">
              Сумкинс
            </div>
          </a>
        </div>
        <div class="mr-4">
          <ThemeSwitcher />
        </div>
      </div>
      <div class="flex flex-col gap-4 pt-6 pb-24 md:pb-6 md:pt-12 mx-6 lg:w-1/3 lg:mx-auto">
        <!-- eslint-disable-next-line unicorn/prefer-top-level-await -->
        {#await requestList()}
          {#each [ 1, 2, 3, 4 ] as index (index)}
            <ListItemCard isSkeleton={true} />
          {/each}
        {:then}
          {#if $list.length === 0}
            <div class="card bg-base-100 md:shadow-xl">
              <div class="card-body prose">
                <h2 class="card-title">Ваш список пуст</h2>
                <p>Добавьте в&nbsp;него свои желания</p>
                <button class="btn btn-primary" on:click={openAddDialog}>
                  Добавить
                </button>
              </div>
            </div>
          {:else}
            {#each $list as listItem (listItem.id)}
              <ListItemCard
                {listItem}
                on:delete={deleteListItem}
                on:refreshlist={requestList}
              />
            {/each}
          {/if}
        {/await}
      </div>
    </div>
    <Menu on:add={openAddDialog} on:clear={gotoClear} />
  </div>

  <ListItemAddDialog
    bind:open={isAddDialogOpen}
    on:add={requestList}
  />

  <ListItemDeleteAlert
    {listItemToDelete}
    bind:open={isDeletionBeingConfirmed}
    on:delete={requestList}
  />
{/if}
