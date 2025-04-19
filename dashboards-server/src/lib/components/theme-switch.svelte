<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { onMount } from 'svelte';
  import { Switch } from 'bits-ui';
  import { ThemeService } from '$lib/theme-service-injection-token.js';
  import { Moon, SunDim } from 'lucide-svelte';

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

<Switch.Root
  bind:checked={isDark}
  aria-label="Переключить тему"
>
  <Switch.Thumb>
    {#if isDark}
      <Moon />
    {:else}
      <SunDim />
    {/if}
  </Switch.Thumb>
</Switch.Root>
