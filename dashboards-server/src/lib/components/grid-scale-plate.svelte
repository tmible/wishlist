<!-- @component Элемент сетки с возможностью увеличения на всю ширину -->
<script>
  import Expand from 'lucide-svelte/icons/expand';
  import Replace from 'lucide-svelte/icons/replace';
  import Shrink from 'lucide-svelte/icons/shrink';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /**
   * Признак увеличения на всю ширину
   * @type {boolean}
   */
  let isExpanded = $state(false);
</script>

{#if isExpanded}
  <div class="flex items-center px-3 grow shrink basis-full md:basis-0">
    <div class="plate w-full h-[calc(100%-2*3*var(--spacing))] relative border-0 overflow-hidden">
      <Replace class="absolute top-1/2 left-1/2 -translate-1/2 size-10" />
    </div>
  </div>
{/if}

<div
  class={(
    isExpanded ?
      'p-3 grow shrink basis-full self-stretch' :
      'p-3 grow shrink basis-full md:basis-1/2 md:not-last:max-w-1/2 self-stretch'
  )}
>
  <div class="plate h-full relative p-3 md:p-6">
    <button
      class="hidden md:inline-flex absolute top-1 right-1 btn btn-xs btn-square"
      onclick={() => isExpanded = !isExpanded}
    >
      {#if isExpanded}
        <Shrink class="size-3" />
      {:else}
        <Expand class="size-3" />
      {/if}
    </button>
    {@render children?.()}
  </div>
</div>
