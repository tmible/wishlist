<!-- Svelte компонент -- ячейка таблицы, с возможностью клика по значению -->
<script>
  import { Button } from '$lib/components/ui/button';

  /**
   * Значение ячейки
   * @type {unknown}
   */
  export let value;

  /**
   * Обработчк клика
   * @type {(event: Event) => void}
   */
  export let onClick;
</script>

<Button class="p-0" variant="link" on:click={onClick}>
  {value}
</Button>
