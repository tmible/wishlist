<!--
@component Заголовок столбца таблицы с элементом управления
для фильтрации строк по значениям столбца простым сравнением
-->
<script>
  import X from 'lucide-svelte/icons/x';

  /** @typedef {import('svelte/store').Writable} Writable */
  /** @typedef {import('./initialization.js').BotUserUpdatesFilters} BotUserUpdatesFilters */

  /**
   * @typedef {object} Props
   * @property {string} label Заголовок столбца
   * @property {Writable<BotUserUpdatesFilters>} filters Фильтры таблицы
   * @property {string} accessor Ключ значений столбца в объекте фильтров или строки таблицы
   */

  /** @type {Props} */
  const { label, filters, accessor } = $props();

  /**
   * Значение элемента управления
   * @type {string}
   */
  let filter = $state('');

  /**
   * Установка значения фильтра
   * @function setFilter
   * @param {KeyboardEvent} event Событие отпускания клавиши в элементе управления
   * @returns {void}
   */
  const setFilter = (event) => {
    if (event.key === 'Enter') {
      filters.update((filtersValue) => ({
        ...filtersValue,
        [accessor]: filter,
      }));
    }
  };

  /**
   * Сброс значений фильтра и элемента управления
   * @function clearFilter
   * @returns {void}
   */
  const clearFilter = () => {
    filters.update((filtersValue) => ({
      ...filtersValue,
      [accessor]: undefined,
    }));
    filter = '';
  };

  // Установка значения в элемент управления при обновлении значения фильтра в хранилище
  $effect(() => {
    if ($filters[accessor] !== undefined) {
      filter = $filters[accessor];
    }
  });
</script>

<div class="py-2 h-full">
  <span class="block mb-1">{label}</span>
  <label class="input input-sm">
    <input
      class:pr-8={$filters[accessor]}
      onkeyup={setFilter}
      bind:value={filter}
    >
    {#if $filters[accessor]}
      <button class="cursor-pointer hover:text-base-content" onclick={clearFilter}>
        <X />
      </button>
    {/if}
  </label>
</div>
