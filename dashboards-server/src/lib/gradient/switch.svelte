<!-- Svelte компонент -- переключатель градиента на фоне страницы -->
<script>
  import { deprive, inject, provide } from '@tmible/wishlist-common/dependency-injector';
  import { subscribe, unsubscribe } from '@tmible/wishlist-common/event-bus';
  import { onDestroy, onMount } from 'svelte';
  import { Switch } from '$lib/components/ui/switch';
  import { ThemeService } from '$lib/theme-service-injection-token.js';
  import * as cssService from './css.service.js';
  import { GradientVariant } from './domain.js';
  import { ApplyGradient, RemoveGradient } from './events.js';
  import * as faviconService from './favicon.service.js';
  import { GradientStore, NextGradientStore } from './injection-tokens.js';
  import { nextStore, store } from './store.js';
  import { adjustGradient } from './use-cases/adjust-gradient.js';
  import { removeGradient } from './use-cases/remove-gradient.js';
  import { setGradient } from './use-cases/set-gradient.js';

  /** @typedef {import('./domain.js').Gradient} Gradient */

  /**
   * Сервис управления темой
   */
  const themeService = inject(ThemeService);

  /**
   * Признак использования градиента
   * @type {boolean}
   */
  let isGradient = !!store.get();

  /**
   * Следующий градиент. Используется для фона компонента при отключенном градиенте
   * @type {Gradient}
   */
  let nextGradient = nextStore.get();

  // Ассоциация значений с токенами внедрения и подписка на события
  provide(GradientStore, store);
  provide(NextGradientStore, nextStore);
  subscribe(ApplyGradient, (gradient) => {
    cssService.applyGradient(gradient);
    faviconService.applyGradient(gradient);
  });
  subscribe(RemoveGradient, (gradient) => {
    cssService.removeGradient(gradient);
    faviconService.removeGradient(gradient);
  });

  // Затемнение или осветление градиента при смене темы
  onMount(() => {
    themeService.subscribeToTheme(
      (isDark) => adjustGradient(isDark ? GradientVariant.DARK : GradientVariant.LIGHT),
    );
  });

  onDestroy(() => {
    deprive(GradientStore);
    deprive(NextGradientStore);
    unsubscribe(ApplyGradient);
    unsubscribe(RemoveGradient);
  });

  // Смена фона
  $: if (isGradient) {
    setGradient();
  } else {
    removeGradient(
      themeService.isDarkTheme() ? GradientVariant.DARK : GradientVariant.LIGHT,
    );

    // trigger rerender
    nextGradient = nextStore.get();
  }
</script>

<Switch
  --bg-color={isGradient ? undefined : cssService.constructStyle(nextGradient ?? {})}
  aria-label="Переключить градиент"
  bind:checked={isGradient}
/>
