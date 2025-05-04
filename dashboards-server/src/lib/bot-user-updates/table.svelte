<!-- @component Таблица с обновлениями, полученными ботом -->
<script>
  import { Pagination } from 'bits-ui';
  import dayjs from 'dayjs';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import { onDestroy } from 'svelte';
  import { derived, writable } from 'svelte/store';
  import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
  import {
    BOT_USER_UPDATES_TABLE_PAGE_SIZE,
  } from '$lib/constants/bot-user-updates-table-page-size.const.js';
  import FilterButton from './filter-button.svelte';
  import { initBotUserUpdatesFeature } from './initialization.js';
  import { botUserUpdates } from './store.js';
  import TableHeaderDateRangeFilter from './table-header-date-range-filter.svelte';
  import TableHeaderSimpleFilter from './table-header-simple-filter.svelte';
  import { getPage } from './use-cases/get-page.js';

  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('svelte-headless-table').Table} Table */
  /** @typedef {import('./initialization.js').BotUserUpdatesDTO} BotUserUpdatesDTO */
  /** @typedef {import('./initialization.js').BotUserUpdatesFilters} BotUserUpdatesFilters */

  /**
   * @typedef {object} Props
   * @property {BotUserUpdatesDTO} data Данные для отображения
   */

  /** @type {Props} */
  const { data } = $props();

  // Инициализация модуля обновлений, полученных ботом
  const destroyBotUserUpdatesFeature = initBotUserUpdatesFeature();

  // Инициализация хранилища данных таблицы
  botUserUpdates.set(data ?? {});

  /**
   * Таймштамп, позже которого выбираются обновления
   * @type {number}
   */
  const timeLock = data?.page?.[0]?.time ?? Date.now();

  /**
   * Значения фильтров столбцов
   * @type {Writable<BotUserUpdatesFilters>}
   */
  const filters = writable({});

  /**
   * Значение прогресса загрузки очередной части обновлений
   * Используется для анимации прогресса
   * @type {number}
   */
  let loadingProgress = $state(0);

  /**
   * Генерация заголовка столбца с полем воода для фильтрации строк по значению столбца
   * @function filterColumnHeader
   * @param {string} label Заголовок столбца
   * @param {string} accessor Ключ значений столбца в объекте строки или фильтров
   * @returns {Pick<Parameters<Table.column>[0], 'header'>} Частичное определение столбца
   */
  const filterColumnHeader = (label, accessor) => ({
    header: () => createRender(
      TableHeaderSimpleFilter,
      {
        label,
        filters,
        accessor,
      },
    ),
  });

  /**
   * Генерация ячейки таблицы, при клике на значение которой будет происходить фильтрация по нему
   * @function filterColumnCell
   * @param {string} accessor Ключ значения ячейки в объекте строки или фильтров
   * @returns {Pick<Parameters<Table.column>[0], 'cell' | 'plugins'>} Частичное определение ячейки
   */
  const filterColumnCell = (accessor) => ({
    cell: ({ value }) => createRender(
      FilterButton,
      {
        value,
        onClick: () => {
          filters.update((filterValue) => ({ ...filterValue, [accessor]: value }));
        },
      },
    ),
  });

  /**
   * Таблица с обновлениями, полученными ботом
   * @type {Table}
   */
  const botUserUpdatesTable = createTable(
    derived(botUserUpdates, ($botUserUpdates) => $botUserUpdates.page, []),
  );

  const columns = botUserUpdatesTable.createColumns([
    botUserUpdatesTable.column({
      accessor: 'time',
      header: () => createRender(
        TableHeaderDateRangeFilter,
        {
          label: 'Время',
          filters,
          accessor: 'time',
        },
      ),
      cell: ({ value }) => dayjs(value).format('DD.MM.YYYY HH:mm:ss.SSS'),
    }),
    botUserUpdatesTable.column({
      accessor: 'chatId',
      ...filterColumnHeader('Чат', 'chatId'),
      ...filterColumnCell('chatId'),
    }),
    botUserUpdatesTable.column({
      accessor: 'userid',
      ...filterColumnHeader('Пользователь', 'userid'),
      ...filterColumnCell('userid'),
    }),
    botUserUpdatesTable.column({
      accessor: 'updateType',
      header: 'Тип обновления',
    }),
    botUserUpdatesTable.column({
      accessor: 'updatePayload',
      header: 'Полезная нагрузка',
    }),
  ]);

  const {
    headerRows,
    rows,
    tableAttrs,
    tableBodyAttrs,
  } = botUserUpdatesTable.createViewModel(columns);

  /**
   * Обновление состояния таблицы. Отложенный запуск анимации загрузки,
   * который будет отменён в случае нахождения в кэше нужного значения.
   * [Запрос страницы таблицы]{@link getPage}
   * @function updateState
   * @param {BotUserUpdatesDTO['index']} index Номер запрашиваемой страницы
   * @param {BotUserUpdatesFilters} filters Значение фильтров
   * @returns {Promise<void>}
   * @async
   */
  const updateState = async (index, filters) => {
    let isLoading = false;
    let startLoading = () => {
      loadingProgress = 1;
      isLoading = true;
    };
    setTimeout(() => startLoading?.());
    await getPage(timeLock, index, filters);
    startLoading = undefined;
    if (!isLoading) {
      return;
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        loadingProgress = 100;
        setTimeout(() => loadingProgress = 0, 300);
      });
    });
  };

  /**
   * Переход на другую страницу таблицы
   * @function paginate
   * @param {BotUserUpdatesDTO['index']} index Номер запрашиваемой страницы
   * @returns {Promise<void>}
   * @async
   * @see {@link updateState}
   */
  const paginate = async (index) => await updateState(index, $filters);

  /**
   * Обновление состояния таблицы при обновлении значения фильтров
   * @see {@link updateState}
   */
  const filtersUnsubscribe = filters.subscribe(
    async (value) => await updateState($botUserUpdates.index, value),
  );

  // Отписка от хранилища фильтров и уничтожение модуля обновлений
  onDestroy(() => {
    filtersUnsubscribe();
    destroyBotUserUpdatesFeature();
  });
</script>

<div class="relative rounded-md border border-inherit mb-3 overflow-x-auto">
  <table class="table" {...$tableAttrs}>
    <thead class="bg-base-300">
      {#each $headerRows as headerRow (headerRow.id)}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <tr>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} props={cell.props()}>
                {#snippet children({ attrs })}
                  <th {...attrs}>
                    <Render of={cell.render()} />
                  </th>
                {/snippet}
              </Subscribe>
            {/each}
          </tr>
        </Subscribe>
      {/each}
    </thead>
    <tbody {...$tableBodyAttrs}>
      {#each $rows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()}>
          {#snippet children({ rowAttrs })}
            <tr class="relative hover:bg-base-200" {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()}>
                  {#snippet children({ attrs })}
                    <td class="text-sm" {...attrs}>
                      <Render of={cell.render()} />
                    </td>
                  {/snippet}
                </Subscribe>
              {/each}
            </tr>
          {/snippet}
        </Subscribe>
      {/each}
    </tbody>
  </table>
  {#if loadingProgress > 0}
    <progress
      class="absolute top-0 progress bg-transparent"
      value={loadingProgress}
      max="100"
    >
    </progress>
  {/if}
</div>

<Pagination.Root
  class="flex justify-center items-center gap-1"
  count={$botUserUpdates.total}
  perPage={BOT_USER_UPDATES_TABLE_PAGE_SIZE}
  bind:page={() => $botUserUpdates.index + 1, async (pageNumber) => await paginate(pageNumber - 1)}
>
  {#snippet children({ pages, currentPage })}
    <Pagination.PrevButton class="btn btn-square btn-ghost">
      <ChevronLeft />
    </Pagination.PrevButton>
    {#each pages as page (page.key)}
      {#if page.type === 'ellipsis'}
        <span class="w-10 text-center pointer-events-none">...</span>
      {:else}
        <Pagination.Page
          class={(
            currentPage === page.value ?
              'btn btn-ghost bg-primary text-primary-content' :
              'btn btn-ghost'
          )}
          {page}
          onclick={async () => await paginate(page.value - 1)}
        >
          {page.value}
        </Pagination.Page>
      {/if}
    {/each}
    <Pagination.NextButton class="btn btn-square btn-ghost">
      <ChevronRight />
    </Pagination.NextButton>
  {/snippet}
</Pagination.Root>

<style>
  progress::-webkit-progress-value {
    transition: width 250ms;
  }

  progress::-moz-progress-value {
    transition: width 250ms;
  }

  progress::-o-progress-value {
    transition: width 250ms;
  }

  progress::progress-value {
    transition: width 250ms;
  }
</style>
