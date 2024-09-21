<!-- Svelte компонент с иконкой переупорядочивания списка -->
<!-- TODO: удалить как только иконка перейдёт из @lucide/lab в lucide-svelte -->
<script>
  import { layoutListMove } from '@lucide/lab';
  import { Icon } from 'lucide-svelte';

  /**
   * Классы для иконки
   * @type {string}
   */
  let className;
  export { className as class };
</script>

<Icon class={className} iconNode={layoutListMove} />
