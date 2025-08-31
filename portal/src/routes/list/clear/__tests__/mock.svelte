<script>
  /* eslint-disable-next-line prefer-const -- Невозможно разорвать определение props */
  let { cardData, onSwipe, swipe = $bindable() } = $props();
  let i = $state(0);
  let data = $state(cardData(i));
  swipe = (direction) => onSwipe({ direction, data });
</script>

{#each [ 'left', 'right' ] as direction (direction)}
  <button
    data-testid={`swipe-${direction}-button`}
    onclick={() => {
      data = cardData(i);
      i += 1;
      onSwipe({ direction, data });
    }}
  >
  </button>
{/each}
