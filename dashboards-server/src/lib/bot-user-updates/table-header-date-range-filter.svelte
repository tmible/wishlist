<!--
@component Заголовок столбца таблицы с элементом управления для фильтрации
строк по значениям столбца проверкой попадания в диапазон дат
-->
<script>
  import { DateRangePicker } from 'bits-ui';
  import Calendar from 'lucide-svelte/icons/calendar';
  import ChevronLeft from 'lucide-svelte/icons/chevron-left';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import X from 'lucide-svelte/icons/x';

  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('./initialization.js').BotUserUpdatesFilters} BotUserUpdatesFilters */
  /**
   * @typedef {import('./initialization.js').BotUserUpdatesRangeFilter} BotUserUpdatesRangeFilter
   */

  /**
   * @typedef {object} Props
   * @property {string} label Заголовок столбца
   * @property {Writable<BotUserUpdatesFilters>} filters Фильтры таблицы
   * @property {string} accessor Ключ значений столбца в объекте фильтров или строки таблицы
   */

  /**
   * Значение элемента управления по умолчанию
   * @constant {BotUserUpdatesRangeFilter}
   */
  const DATE_RANGE_PLACEHOLDER = { start: undefined, end: undefined };

  /** @type {Props} */
  const { label, filters, accessor } = $props();

  /**
   * Корневой элемент элемента управления для выбора диапазона дат
   * @type {HTMLDivElement | null}
   */
  let dateRangePickerRoot = $state(null);

  /**
   * Значение элемента управления
   * @type {BotUserUpdatesRangeFilter}
   */
  let filter = $state(DATE_RANGE_PLACEHOLDER);

  /**
   * Установка значений фильтра и элемента управления
   * @function setFilter
   * @param {BotUserUpdatesRangeFilter} dateRange Значение к установке
   * @returns {void}
   */
  const setFilter = (dateRange) => {
    filter = dateRange;
    if (dateRange.start !== undefined && dateRange.end !== undefined) {
      filters.update((filtersValue) => ({
        ...filtersValue,
        [accessor]: {
          start: dateRange.start.toDate().getTime(),
          end: dateRange.end.toDate().getTime(),
        },
      }));
    }
  };

  /**
   * Сброс значений фильтра и элемента управления
   * @function clearFilter
   * @returns {void}
   */
  const clearFilter = () => {
    filter = DATE_RANGE_PLACEHOLDER;
    filters.update((filtersValue) => ({
      ...filtersValue,
      [accessor]: undefined,
    }));
  };
</script>

<div class="py-2 h-full">
  <span class="block mb-1">{label}</span>
  <DateRangePicker.Root
    class="input input-sm z-1"
    locale="ru-RU"
    weekdayFormat="short"
    disableDaysOutsideMonth={true}
    bind:ref={dateRangePickerRoot}
    bind:value={() => filter, setFilter}
  >
    {#snippet input(type, className = '')}
      <DateRangePicker.Input class={className} {type}>
        {#snippet children({ segments })}
          {#each segments.entries() as [ i, { part, value } ] (i)}
            <DateRangePicker.Segment {part}>
              {value}
            </DateRangePicker.Segment>
          {/each}
        {/snippet}
      </DateRangePicker.Input>
    {/snippet}
    {@render input('start')}
    ‒
    {@render input('end', 'mr-auto')}
    <DateRangePicker.Trigger class="cursor-pointer hover:text-base-content">
      <Calendar class="w-5 h-5" />
    </DateRangePicker.Trigger>
    {#if JSON.stringify(filter) !== '{}'}
      <button class="cursor-pointer hover:text-base-content" onclick={clearFilter}>
        <X />
      </button>
    {/if}
    <DateRangePicker.Content
      class="popover text-base-content"
      sideOffset={8}
      customAnchor={dateRangePickerRoot}
    >
      <DateRangePicker.Calendar>
        {#snippet children({ months, weekdays })}
          <DateRangePicker.Header class="max-w-full flex items-center justify-between">
            <DateRangePicker.PrevButton class="btn btn-sm btn-square btn-ghost">
              <ChevronLeft class="w-5 h-5" />
            </DateRangePicker.PrevButton>
            <DateRangePicker.Heading />
            <DateRangePicker.NextButton class="btn btn-sm btn-square btn-ghost">
              <ChevronRight class="w-5 h-5" />
            </DateRangePicker.NextButton>
          </DateRangePicker.Header>
          {#each months as month (`${month.value.month}.${month.value.year}`)}
            <DateRangePicker.Grid class="mx-auto border-separate border-spacing-y-2">
              <DateRangePicker.GridHead>
                <DateRangePicker.GridRow>
                  {#each weekdays as day (day)}
                    <DateRangePicker.HeadCell>
                      {day}
                    </DateRangePicker.HeadCell>
                  {/each}
                </DateRangePicker.GridRow>
              </DateRangePicker.GridHead>
              <DateRangePicker.GridBody>
                {#each month.weeks as weekDates (`${weekDates[0].day}.${weekDates[0].month}`)}
                  <DateRangePicker.GridRow>
                    {#each weekDates as date (date.day)}
                      <!-- eslint-disable @stylistic/js/max-len -- Длинный класс -->
                      <DateRangePicker.Cell
                        class="
                          data-disabled:cursor-default
                          not-data-disabled:cursor-pointer
                          not-data-disabled:not-data-selection-start:not-data-selection-end:hover:bg-base-200
                          data-selected:bg-base-200/50
                          data-selection-start:bg-primary
                          data-selection-end:bg-primary
                          data-selection-start:text-primary-content
                          data-selection-end:text-primary-content
                          first:rounded-l-field
                          last:rounded-r-field
                          data-selection-start:rounded-l-field
                          data-selection-end:rounded-r-field
                          not-data-selected:rounded-field
                          data-outside-month:text-base-content/50
                        "
                        {date}
                        month={month.value}
                      >
                        <!-- eslint-enable @stylistic/js/max-len -->
                        <DateRangePicker.Day>
                          {date.day}
                        </DateRangePicker.Day>
                      </DateRangePicker.Cell>
                    {/each}
                  </DateRangePicker.GridRow>
                {/each}
              </DateRangePicker.GridBody>
            </DateRangePicker.Grid>
          {/each}
        {/snippet}
      </DateRangePicker.Calendar>
    </DateRangePicker.Content>
  </DateRangePicker.Root>
</div>
