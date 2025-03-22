<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { Moon, SunDim } from 'lucide-svelte';
  import { InjectionToken } from '$lib/architecture/injection-token';

  /**
   * Внедрение сервиса управления темой
   */
  const { isDarkTheme, updateTheme } = inject(InjectionToken.ThemeService);

  /**
   * Признак использования тёмной темы
   * @type {boolean}
   */
  let isDark = $state(isDarkTheme());

  /**
   * Смена темы
   */
  $effect(() => updateTheme(isDark));
</script>

<label class="toggle bg-base-100 text-base-content">
  <input type="checkbox" bind:checked={isDark}>
  <SunDim class="p-0 w-full h-full" aria-label="enabled" />
  <Moon class="p-0 w-full h-full" aria-label="disabled" />
</label>
