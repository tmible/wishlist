<script>
  import { onMount } from 'svelte';

  let portal;

  onMount(() => {
    const observer = new MutationObserver(
      () => portal[portal.childElementCount > 0 ? 'setAttribute' : 'removeAttribute']('open', ''),
    );
    observer.observe(portal, { childList: true });
    return () => observer.disconnect();
  });
</script>

<div bind:this={portal} id="modal-portal" class="modal"></div>
