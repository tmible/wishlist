<script>
  /* eslint-disable no-undef-init, unicorn/no-useless-undefined, svelte/valid-compile --
     Необязательные свойства Svelte компонента */
  export let form = undefined;
  export let open = undefined;
  export let listItemToDelete = undefined;
  export let isSkeleton = undefined;
  export let listItem = undefined;
  export let text = undefined;
  export let entities = undefined;
  export let values = undefined;
  export let name = undefined;
  export let className = undefined;
  export let value = undefined;
  export let placeholder = undefined;
  export let isMenuHidden = undefined;
  export let isReorderModeOn = undefined;
/* eslint-enable no-undef-init, unicorn/no-useless-undefined, svelte/valid-compile */
</script>

{#if isSkeleton}
  <span>Skeleton mock</span>
{/if}

{#if listItem}
  <span>List item mock</span>
{/if}

Mock
