<!-- Svelte компонент -- ячейка таблицы, с возможностью клика по значению -->
<script>

  /**
   * @typedef {object} Props
   * @property {unknown} value Значение ячейки
   * @property {(event: Event) => void} onClick Обработчк клика
   */

  /** @type {Props} */
  const { value, onClick } = $props();
</script>

<button class="p-0" variant="link" onclick={onClick}>
  {value}
</button>
