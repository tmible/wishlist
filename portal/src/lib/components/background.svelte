<script>
  import { subscribeToTheme } from '@tmible/wishlist-ui/theme/service';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /**
   * Актуальный цветовой акцент темы
   * @type {string}
   */
  let accent = $state();

  // Обновление акцента
  onMount(() => subscribeToTheme(({ accent: themeAccent }) => accent = themeAccent));
</script>

{#if accent === 'blossom'}
  <img
    class="fixed w-4/5 md:w-1/3 translate-x-1/14 -scale-x-100 rotate-[-21deg]"
    src="188f61ec-d510-4aed-b132-3dfb7718b7e4.webp"
    loading="lazy"
    decoding="async"
    alt="cherry branch"
  >
  <img
    class="hidden md:block absolute w-1/3 right-0 -translate-x-1/14 rotate-[21deg]"
    src="188f61ec-d510-4aed-b132-3dfb7718b7e4.webp"
    loading="lazy"
    decoding="async"
    alt="cherry branch"
  >
{:else if accent === 'elegant'}
  {#if page.url.pathname === '/'}
    <img
      class="
        absolute
        w-1/2
        md:w-1/3
        md:bottom-0
        translate-x-1/16
        translate-y-[64px]
        md:-translate-y-1/4
        dark:brightness-133
      "
      src="signature.svg"
      loading="lazy"
      decoding="async"
      alt="signature"
    >
  {:else}
    <img
      class="absolute w-1/2 md:w-1/3 bottom-0 translate-x-1/16 -translate-y-1/4 dark:brightness-133"
      src="signature.svg"
      loading="lazy"
      decoding="async"
      alt="signature"
    >
  {/if}
{/if}
<div class="h-dvh dark:backdrop-brightness-75">
  {@render children?.()}
</div>
