<!-- Svelte компонент -- индикатор общего здоровья сервиса -->
<script>
  import { health } from './store.js';

  /** @typedef {'bot' | 'portal' | 'hub'} Service */

  /**
   * Ключ сервиса в объекте с данными о проверке здороья сервисов
   * @type {Service}
   */
  export let service;

  /**
   * Признак наличия у сервиса проблем
   * @type {boolean}
   */
  $: serviceHasProblems = $health.date && Object.values($health[service]).some((value) => !value);

  /**
   * Признак наличия у сервиса успешных проверок
   * @type {boolean}
   */
  $: serviceHasHealthes = $health.date && Object.values($health[service]).some(Boolean);
</script>

<div
  class="w-2 h-2 rounded-full"
  class:success-bg={!serviceHasProblems}
  class:warning-bg={serviceHasProblems && serviceHasHealthes}
  class:error-bg={!serviceHasHealthes}
  class:undefined-bg={!$health[service]}
></div>
