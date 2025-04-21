<!-- Svelte компонент -- таблица со всеми обновлениями, полученными ботом -->
<script>
  import { Pagination } from 'bits-ui';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import objectSupport from 'dayjs/plugin/objectSupport';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import { readable } from 'svelte/store';
  import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
  import { addColumnFilters, addPagination } from 'svelte-headless-table/plugins';
  import FilterButton from './filter-button.svelte';
  import TableHeaderFilter from './table-header-filter.svelte';

  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('svelte-headless-table').Table} Table */
  /** @typedef {import('svelte-headless-table').Id} Id */
  /** @typedef {import('svelte-headless-table').FilterValue} FilterValue */

  /**
   * Обновление, полученное ботом
   * @typedef {object} TableData
   * @property {number} time Отметка времени получения обновления
   * @property {number} chatId Идентификтатор чата
   * @property {number} userid Идентификатор пользователя
   * @property {string} updateType Тип обновления
   * @property {string} updatePayload Полезная нагрузка обновления
   */

  dayjs.extend(isBetween);
  dayjs.extend(objectSupport);

  /**
   * @typedef {object} Props
   * @property {TableData[]} data Данные для отображения
   */

  /** @type {Props} */
  const { data } = $props();

  /**
   * Значения фильтров столбцов
   * @type {Writable<Record<Id, FilterValue>>}
   */
  let filterValues;

  /**
   * Генерация заголовка столбца с полем воода для фильтрации строк по значению столбца
   * @function filterColumnHeader
   * @param {string} label Заголовок столбца
   * @param {string} accessor Ключ значений столбца в объекте строки или фильтров
   * @param {'input' | 'date range'} type Тип фильтра
   * @returns {Pick<Parameters<Table.column>[0], 'header'>} Частичное определение столбца
   */
  const filterColumnHeader = (label, accessor, type = 'input') => ({
    header: () => createRender(
      TableHeaderFilter,
      {
        label,
        filters: filterValues,
        accessor,
        type,
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
          filterValues.update((filterValue) => ({ ...filterValue, [accessor]: value }));
        },
      },
    ),
    plugins: {
      colFilter: {
        fn: ({ filterValue, value }) => !filterValue || value.toString().startsWith(filterValue),
      },
    },
  });

  /**
   * Таблица с обновлениями, полученными ботом
   * @type {Table}
   */
  const userSessionsTable = createTable(
    readable(data),
    {
      page: addPagination(),
      colFilter: addColumnFilters(),
    },
  );

  const columns = userSessionsTable.createColumns([
    userSessionsTable.column({
      accessor: 'time',
      ...filterColumnHeader('Время', 'time', 'date range'),
      cell: ({ value }) => dayjs(value).format('DD.MM.YYYY HH:mm:ss.SSS'),
      plugins: {
        colFilter: {
          fn: ({ filterValue, value }) => (
            !filterValue.start || !filterValue.end || dayjs(value).isBetween(
              dayjs(filterValue.start),
              dayjs(filterValue.end),
              'day',
              '[]',
            )
          ),
          initialFilterValue: { start: undefined, end: undefined },
        },
      },
    }),
    userSessionsTable.column({
      accessor: 'chatId',
      ...filterColumnHeader('Чат', 'chatId'),
      ...filterColumnCell('chatId'),
    }),
    userSessionsTable.column({
      accessor: 'userid',
      ...filterColumnHeader('Пользователь', 'userid'),
      ...filterColumnCell('userid'),
    }),
    userSessionsTable.column({
      accessor: 'updateType',
      header: 'Тип обновления',
    }),
    userSessionsTable.column({
      accessor: 'updatePayload',
      header: 'Полезная нагрузка',
    }),
  ]);

  const {
    headerRows,
    rows,
    pageRows,
    tableAttrs,
    tableBodyAttrs,
    pluginStates,
  } = userSessionsTable.createViewModel(columns);
  ({ filterValues } = pluginStates.colFilter);
  const { pageIndex } = pluginStates.page;

  // Обновление пагинации при фильтрации строк таблицы
  $effect(() => {
    if (pageIndex) {
      $pageIndex = Math.min($pageIndex, Math.floor(($rows?.length ?? 0) / 10));
    }
  });
</script>

<div class="rounded-md border border-inherit mb-3 overflow-x-auto">
  <table class="table table-sm" {...$tableAttrs}>
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
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()}>
          {#snippet children({ rowAttrs })}
            <tr class="hover:bg-base-200" {...rowAttrs}>
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
</div>

<Pagination.Root
  class="flex justify-center items-center gap-1"
  count={$rows.length}
  perPage={10}
  bind:page={() => $pageIndex + 1, (pageNumber) => $pageIndex = pageNumber - 1}
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
          onclick={() => $pageIndex = page.value - 1}
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
