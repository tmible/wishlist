<!-- Элемент управления выбором категории -->
<script>
  import { Select } from 'bits-ui';
  import Check from 'lucide-svelte/icons/check';
  import { categories } from './store.js';

  /**
   * @typedef {object} Props
   * @property {number | ''} selectedCategoryId Идентификатор выбранной категории
   * @property {string} [name] Имя для HTMLInputElement
   */

  /** @type {Props} */
  /* eslint-disable-next-line prefer-const -- Невозможно разорвать определение props */
  let { selectedCategoryId = $bindable(), name = 'categoryId' } = $props();

  /**
   * Название выбранной категории
   * @type {string}
   */
  const selectedCategoryName = $derived(
    $categories.find(({ id }) => id === selectedCategoryId)?.name ?? '',
  );
</script>

<Select.Root
  {name}
  type="single"
  preventScroll={false}
  allowDeselect={true}
  items={$categories}
  disabled={$categories.length === 0}
  bind:value={selectedCategoryId}
>
  <Select.Trigger
    class="
      select
      select-bordered
      bg-base-200
      items-center
      w-full
      data-placeholder:text-placeholder
      disabled:cursor-default
    "
  >
    {selectedCategoryName || 'Категория'}
  </Select.Trigger>

  <Select.Portal>
    <Select.Content side="bottom" align="center" sideOffset={8} strategy="fixed">
      {#snippet child({ wrapperProps, props })}
        <!-- eslint-disable svelte/no-inline-styles --
          Floating UI пишет z-index: auto прямо в стили элемента -->
        <div style:z-index="1000" {...wrapperProps}>
          <!-- eslint-enable svelte/no-inline-styles -->
          <ul
            class="
              shadow-xl
              menu
              bg-base-200
              rounded-lg
              not-prose
              w-[var(--bits-select-anchor-width)]
            "
            {...props}
          >
            {#each $categories as { id, name } (id)}
              <Select.Item value={id} label={name}>
                {#snippet child({ props, selected })}
                  <li {...props}>
                    <div class="flex justify-between">
                      {name}
                      {#if selected}
                        <Check />
                      {/if}
                    </div>
                  </li>
                {/snippet}
              </Select.Item>
            {/each}
          </ul>
        </div>
      {/snippet}
    </Select.Content>
  </Select.Portal>
</Select.Root>
