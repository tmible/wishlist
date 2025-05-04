<!-- @component Ячейка таблицы, с возможностью клика по значению -->
<script>

  /**
   * @typedef {object} Props
   * @property {unknown} value Значение ячейки
   * @property {(event: Event) => void} onClick Обработчк клика
   */

  /** @type {Props} */
  const { value, onClick } = $props();
</script>

<button class="btn h-0 btn-link p-0 no-underline hover:underline" onclick={onClick}>
  {value}
</button>
