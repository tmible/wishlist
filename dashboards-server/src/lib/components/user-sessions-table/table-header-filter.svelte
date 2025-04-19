<!--
Svelte компонент -- заголовок столбца таблицы с
полем ввода для фильтрации строк по значениям столбца
-->
<script>
  import Cross2 from 'svelte-radix/Cross2.svelte';
  import { Button } from '$lib/components/ui/button';
  import { DateRangePicker } from '$lib/components/ui/date-range-picker';
  import { Input } from '$lib/components/ui/input';

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
          <Button
            class="p-0 h-auto right-[6px] top-[6px] cursor-pointer absolute"
            variant="ghost"
            on:click={() => {
              filters.update((filtersValue) => ({ ...filtersValue, [accessor]: '' }));
            }}
          >
            <Cross2 />
          </Button>
        {/if}
      </DateRangePicker>
    {:else}
      <!-- eslint-disable-next-line svelte/valid-compile -- input внутри Input -->
      <label>
        <span class="block mb-1">{label}</span>
        <Input
          class={$filters[accessor] ? 'pr-8 absolute' : 'absolute'}
          bind:value={$filters[accessor]}
        />
      </label>
      {#if $filters[accessor]}
        <Button
          class="p-0 h-auto right-[6px] translate-y-[6px] cursor-pointer absolute"
          variant="ghost"
          on:click={() => {
            filters.update((filtersValue) => ({ ...filtersValue, [accessor]: '' }));
          }}
        >
          <Cross2 />
        </Button>
      {/if}
    {/if}
  </div>
</div>
