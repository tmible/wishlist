<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { InjectionToken } from '$lib/architecture/injection-token';
  import { Switch } from '$lib/components/ui/switch';

  /**
   * Внедрение сервиса управления темой
   */
  const { isDarkTheme, updateTheme } = inject(InjectionToken.ThemeService);

  /**
   * Признак использования тёмной темы
   * @type {boolean}
   */
  let isDark = isDarkTheme();

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
