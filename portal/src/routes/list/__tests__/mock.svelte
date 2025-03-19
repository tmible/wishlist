<script>
  const { isSkeleton, listItem } = $props();
</script>

{#if isSkeleton}
  <span>Skeleton mock</span>
{/if}

{#if listItem}
  <span>List item mock</span>
{/if}

Mock
