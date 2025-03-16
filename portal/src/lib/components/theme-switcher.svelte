<!-- Svelte компонент -- переключатель цветовой темы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { Switch } from 'bits-ui';
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
  let isDark = isDarkTheme();

  /**
   * Смена темы
   */
  $: updateTheme(isDark);
</script>

<Switch.Root
  class="toggle bg-base-content hover:bg-base-content"
  aria-label="Переключить тему"
  bind:checked={isDark}
>
  <Switch.Thumb asChild let:attrs>
    <div
      class="h-full w-1/2 p-[3px]"
      class:ml-auto={isDark}
      class:pr-[4px]={!isDark}
      {...attrs}
    >
      <svelte:component this={isDark ? Moon : SunDim} class="w-full h-full text-base-100" />
    </div>
  </Switch.Thumb>
</Switch.Root>
