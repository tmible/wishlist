<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { onMount } from 'svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { ThemeService } from '$lib/theme-service-injection-token.js';

  /**
   * Внедрение сервиса управления темой
   */
  const { isDarkTheme, updateTheme, subscribeToTheme } = inject(ThemeService);

  /**
   * Признак использования тёмной темы
   * @type {boolean}
   */
  let isDark = isDarkTheme();

  onMount(() => subscribeToTheme((isThemeDark) => isDark = isThemeDark));

  /**
   * Смена темы
   */
  $: updateTheme(isDark);
</script>

<Switch
  --thumb-icon={isDark ? 'url("/moon.svg")' : 'url("/sun.svg")'}
  aria-label="Переключить тему"
  bind:checked={isDark}
/>
