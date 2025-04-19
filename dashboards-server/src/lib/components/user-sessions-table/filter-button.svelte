<!-- Svelte компонент -- ячейка таблицы, с возможностью клика по значению -->
<script>
  import { Button } from '$lib/components/ui/button';

  /**
   * @typedef {object} Props
   * @property {unknown} value Значение ячейки
   * @property {(event: Event) => void} onClick Обработчк клика
   */

  /** @type {Props} */
  const { value, onClick } = $props();
</script>

<Button class="p-0" variant="link" on:click={onClick}>
  {value}
</Button>
