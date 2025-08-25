<!-- @component Тост -->
<script>

  /**
   * @typedef {object} Props
   * @property {import('svoast').ToastType} type Тип тоста
   * @property {string} message Сообщение тоста
   */

  /** @type {Props} */
  const { type, message } = $props();
</script>

<div
  class="alert"
  class:alert-info={type === 'info'}
  class:alert-success={type === 'success'}
  class:alert-warning={type === 'warning'}
  class:alert-error={type === 'error'}
>
  {message}
</div>
