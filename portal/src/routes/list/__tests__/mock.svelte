<script>
  const { isSkeleton, item } = $props();
</script>

{#if isSkeleton}
  <span>Skeleton mock</span>
{/if}

{#if item}
  <span>Item mock</span>
{/if}

Mock
