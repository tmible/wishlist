<!-- Единый портал для всех диалогов приложения -->
<script>
  import { onMount } from 'svelte';

  /**
   * Элемент портала
   * @type {HTMLDivElement}
   */
  let portal;

  /**
   * Установка [элементу]{@link portal} атрибута 'open' при появлении
   * дочерних элементов и удаление при удалении дочерних элементов
   */
  onMount(() => {
    const observer = new MutationObserver(
      () => portal[portal.childElementCount > 0 ? 'setAttribute' : 'removeAttribute']('open', ''),
    );
    observer.observe(portal, { childList: true });
    return () => observer.disconnect();
  });
</script>

<div bind:this={portal} id="modal-portal" class="modal"></div>
