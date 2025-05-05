<!-- @component Переключатель градиента на фоне страницы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { ThemeService } from '@tmible/wishlist-ui/theme/injection-tokens';
  import { onDestroy, onMount } from 'svelte';
  import * as cssService from './css.service.js';
  import { GradientVariant } from './domain.js';
  import { initGradientFeature } from './initialization.js';
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
  let isGradient = $state(!!store.get());

  /**
   * Регистрация зависисмостей и подписка на события для работы с градиентом
   * Функция освобождения зависимостей и отписки от событий
   * @type {() => void}
   */
  const destroyGradientFeature = initGradientFeature();

  // Затемнение или осветление градиента при смене темы
  onMount(() => themeService.subscribeToTheme(
    (isDark) => adjustGradient(isDark ? GradientVariant.DARK : GradientVariant.LIGHT),
  ));

  onDestroy(() => {
    destroyGradientFeature();
  });

  // Смена фона
  $effect(() => {
    if (isGradient) {
      setGradient();
    } else {
      removeGradient(
        themeService.isDarkTheme() ? GradientVariant.DARK : GradientVariant.LIGHT,
      );
    }
  });
</script>

<!-- eslint-disable svelte/no-inline-styles --
  Генерируемый случаным образом в процессе выполнения стиль -->
<label
  style:background={isGradient ? null : cssService.constructStyle($nextStore ?? {})}
  class="toggle bg-base-100 text-base-content"
>
  <!-- eslint-enable svelte/no-inline-styles -->
  <input type="checkbox" bind:checked={isGradient}>
</label>
