<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { onMount } from 'svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { ThemeService } from '$lib/theme-service-injection-token.js';

  // Внедрение сервиса управления темой
  const { isDarkTheme, updateTheme, subscribeToTheme } = inject(ThemeService);

  /**
   * Признак использования тёмной темы
   * @type {boolean}
   */
  let isDark = $state(isDarkTheme());

  // Обновление состояния при изменении темы в сервисе
  onMount(() => subscribeToTheme((isThemeDark) => isDark = isThemeDark));

  // Смена темы
  $effect(() => updateTheme(isDark));
</script>

<Switch
  --thumb-icon={isDark ? 'url("/moon.svg")' : 'url("/sun.svg")'}
  aria-label="Переключить тему"
  bind:checked={isDark}
/>
