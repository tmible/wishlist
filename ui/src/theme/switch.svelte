<!-- @component Переключатель цветовой темы -->
<script>
  import { Moon, SunDim } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { subscribeToTheme, updateTheme } from './service.js';

  /**
   * Признак использования тёмной темы
   * @type {boolean}
   */
  let isDark = $state();

  // Обновление состояния при изменении темы в сервисе
  onMount(() => subscribeToTheme((isThemeDark) => isDark = isThemeDark));

  // Смена темы
  $effect(() => updateTheme(isDark));
</script>

<label class="toggle bg-base-100 text-base-content">
  <input type="checkbox" bind:checked={isDark}>
  <SunDim class="p-0 w-full h-full" aria-label="enabled" />
  <Moon class="p-0 w-full h-full" aria-label="disabled" />
</label>
