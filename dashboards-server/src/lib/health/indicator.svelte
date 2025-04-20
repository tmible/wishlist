<!-- Svelte компонент -- индикатор общего здоровья сервиса -->
<script>
  import { health } from './store.js';

  /** @typedef {'bot' | 'portal' | 'hub'} Service */

  /**
   * @typedef {object} Props
   * @property {Service} service Ключ сервиса в объекте с данными о проверке здороья сервисов
   */

  /** @type {Props} */
  const { service } = $props();

  /**
   * Признак наличия у сервиса проблем
   * @type {boolean}
   */
  const serviceHasProblems = $derived(
    $health.date && Object.values($health[service]).some((value) => !value),
  );

  /**
   * Признак наличия у сервиса успешных проверок
   * @type {boolean}
   */
  const serviceHasHealthes = $derived(
    $health.date && Object.values($health[service]).some(Boolean),
  );
</script>

<div
  class="w-2 h-2 rounded-full"
  class:bg-success={!serviceHasProblems}
  class:bg-warning={serviceHasProblems && serviceHasHealthes}
  class:bg-error={!serviceHasHealthes}
  class:bg-undefined={!$health[service]}
></div>
