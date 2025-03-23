<script>
  import { ScrollArea } from 'bits-ui';

  /* eslint-disable prefer-const -- Невозможно разорвать определение props */
  let {
    ref = $bindable(null),
    orientation = 'vertical',
    viewportClasses,
    children,
    ...restProps
  } = $props();
/* eslint-enable prefer-const */
</script>

{#snippet Scrollbar({ orientation })}
  <ScrollArea.Scrollbar
    class="
      hidden
      md:flex
      hover:bg-gray-3
      dark:hover:bg-gray-7
      data-[state=visible]:animate-in
      data-[state=hidden]:animate-out
      data-[state=hidden]:fade-out-0
      data-[state=visible]:fade-in-0
      w-2.5
      hover:w-3
      touch-none
      select-none
      rounded-full
      border-l
      border-l-transparent
      p-px
      transition-all
    "
    {orientation}
  >
    <ScrollArea.Thumb class="bg-gray-5 dark:bg-gray-4 flex-1 rounded-full" />
  </ScrollArea.Scrollbar>
{/snippet}

<ScrollArea.Root bind:ref {...restProps}>
  <ScrollArea.Viewport class={viewportClasses}>
    {@render children?.()}
  </ScrollArea.Viewport>
  {#if orientation === 'vertical' || orientation === 'both'}
    {@render Scrollbar({ orientation: 'vertical' })}
  {/if}
  {#if orientation === 'horizontal' || orientation === 'both'}
    {@render Scrollbar({ orientation: 'horizontal' })}
  {/if}
  <ScrollArea.Corner />
</ScrollArea.Root>
