<!-- Svelte компонент -- таблица со всеми обновлениями, полученными ботом -->
<script>
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import objectSupport from 'dayjs/plugin/objectSupport';
  import { readable } from 'svelte/store';
  import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
  import { addColumnFilters, addPagination } from 'svelte-headless-table/plugins';
  import * as Card from '$lib/components/ui/card';
  import * as Pagination from '$lib/components/ui/pagination';
  import * as Table from '$lib/components/ui/table';
  import FilterButton from './filter-button.svelte';
  import TableHeaderFilter from './table-header-filter.svelte';

  /** @typedef {import('svelte/store').Writable} Writable */
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
   * Данные для отображения
   * @type {TableData[]}
   */
  export let data;

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
   * Таблицы с обновлениями, полученными ботом
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

  /**
   * Обновление пагинации при фильтрации строк таблицы
   */
  $: if (pageIndex) {
    $pageIndex = Math.min($pageIndex, Math.floor(($rows?.length ?? 0) / 10));
  }
</script>

<Card.Root>
  <Card.Content class="pt-3 md:pt-6">
    <div class="rounded-md border mb-3 bg-card">
      <Table.Root {...$tableAttrs}>
        <Table.Header class="bg-secondary h-20">
          {#each $headerRows as headerRow (headerRow.id)}
            <Subscribe rowAttrs={headerRow.attrs()}>
              <Table.Row>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} props={cell.props()} let:attrs>
                    <Table.Head {...attrs}>
                      <Render of={cell.render()} />
                    </Table.Head>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Header>
        <Table.Body {...$tableBodyAttrs}>
          {#each $pageRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <Table.Row {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs}>
                      <Render of={cell.render()} />
                    </Table.Cell>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>

    <Pagination.Root
      count={$rows.length}
      page={$pageIndex + 1}
      perPage={10}
      let:pages
      let:currentPage
    >
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton on:click={() => $pageIndex -= 1} />
        </Pagination.Item>
        {#each pages as page (page.key)}
          {#if page.type === 'ellipsis'}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item isVisible={currentPage === page.value}>
              <Pagination.Link
                {page}
                isActive={currentPage === page.value}
                on:click={() => $pageIndex = page.value - 1}
              >
                {page.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton on:click={() => $pageIndex += 1} />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  </Card.Content>
</Card.Root>
