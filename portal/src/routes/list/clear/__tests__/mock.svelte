<script>
  const { cardData, swiped } = $props();
  let i = $state(0);
</script>

<button
  data-testid="swipe-right-button"
  onclick={() => {
    cardData(i);
    i += 1;
    swiped('right');
  }}
>
</button>
