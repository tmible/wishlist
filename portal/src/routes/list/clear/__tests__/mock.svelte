<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let cardData;

  /* eslint-disable-next-line svelte/valid-compile, no-undef-init, unicorn/no-useless-undefined --
     Необязательные свойства Svelte компонента */
  export let thresholdPassed = undefined;

  let i = 0;
</script>

<button
  data-testid="swipe-right-button"
  on:click={() => {
    cardData(i);
    i += 1;
    dispatch('swiped', 'right');
  }}
/>
