<!-- Svelte компонент -- переключатель градиента на фоне страницы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { onMount } from 'svelte';
  import { InjectionToken } from '$lib/architecture/injection-token';
  import { Switch } from '$lib/components/ui/switch';
  import { adjustGradient, generateGradient } from '$lib/gradient-generator';

  /** @typedef {import('$lib/gradient-generator').Gradient} Gradient */

  /**
   * Сервис управления темой
   */
  const themeService = inject(InjectionToken.ThemeService);

  /**
   * Признак использования градиента
   * @type {boolean}
   */
  let isGradient = !!localStorage.getItem('gradient');

  /**
   * Активный градиент
   * @type {Gradient}
   */
  let gradient = JSON.parse(localStorage.getItem('gradient'));

  /**
   * Кеширование в localStorage и установка градиента
   * @function applyGradient
   * @returns {void}
   */
  const applyGradient = () => {
    localStorage.setItem('gradient', JSON.stringify(gradient));
    document.documentElement.style.setProperty('--gradient', gradient.style);
  };

  /**
   * Затемнение или осветление градиента при смене темы
   */
  onMount(() => themeService.subscribeToTheme((isDark) => {
    gradient = adjustGradient(gradient, isDark);

    if (isGradient) {
      applyGradient();
    }
  }));

  /**
   * Смена фона
   */
  $: if (isGradient) {
    applyGradient();
  } else {
    gradient = generateGradient(themeService.isDarkTheme());
    localStorage.removeItem('gradient');
    document.documentElement.style.setProperty('--gradient', undefined);
  }
</script>

<Switch --bg-color={isGradient ? undefined : gradient.style} bind:checked={isGradient} />
