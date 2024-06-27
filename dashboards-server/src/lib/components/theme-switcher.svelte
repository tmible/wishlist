<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '$lib/architecture/dependency-injector';
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

<Switch --thumb-icon={isDark ? 'url("/moon.svg")' : 'url("/sun.svg")'} bind:checked={isDark} />
