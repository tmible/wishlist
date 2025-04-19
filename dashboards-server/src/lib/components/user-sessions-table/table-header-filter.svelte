<!--
Svelte компонент -- заголовок столбца таблицы с
полем ввода для фильтрации строк по значениям столбца
-->
<script>
  import X from 'lucide-svelte/icons/x';
  import { DateRangePicker } from 'bits-ui';

  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('svelte-headless-table').Id} Id */
  /** @typedef {import('svelte-headless-table').FilterValue} FilterValue */

  /**
   * @typedef {object} Props
   * @property {string} label Заголовок столбца
   * @property {Writable<Record<Id, FilterValue>>} filters Фильтры таблицы
   * @property {string} accessor Ключ значений столбца в объекте строки или фильтров
   * @property {'input' | 'date range'} [type] Тип фильтра
   */

  /** @type {Props} */
  const {
    label,
    filters,
    accessor,
    type = 'input',
  } = $props();
</script>

<div class="py-2 h-full">
  <div class="relative">
    {#if type === 'date range'}
      <p class="mb-1">{label}</p>
      <DateRangePicker
        class={$filters[accessor] ? 'pr-8 absolute w-fit' : 'absolute w-fit'}
        bind:value={$filters[accessor]}
      >
        {#if $filters[accessor]}
          <button
            class="p-0 h-auto right-[6px] top-[6px] cursor-pointer absolute"
            variant="ghost"
            onclick={() => {
              filters.update((filtersValue) => ({ ...filtersValue, [accessor]: '' }));
            }}
          >
            <X />
          </button>
        {/if}
      </DateRangePicker>
    {:else}
      <!-- eslint-disable-next-line svelte/valid-compile -- input внутри Input -->
      <label>
        <span class="block mb-1">{label}</span>
        <input
          class={$filters[accessor] ? 'pr-8 absolute' : 'absolute'}
          bind:value={$filters[accessor]}
        />
      </label>
      {#if $filters[accessor]}
        <button
          class="p-0 h-auto right-[6px] translate-y-[6px] cursor-pointer absolute"
          variant="ghost"
          onclick={() => {
            filters.update((filtersValue) => ({ ...filtersValue, [accessor]: '' }));
          }}
        >
          <X />
        </button>
      {/if}
    {/if}
  </div>
</div>
