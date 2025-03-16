<!-- Svelte компонент -- переключатель градиента на фоне страницы -->
<script>
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { onMount } from 'svelte';
  import { InjectionToken } from '$lib/architecture/injection-token';
  import { Switch } from '$lib/components/ui/switch';
  import { FAVICON } from '$lib/constants/favicon.const.js';
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
   * Элемент с favicon
   * @type {HTMLElement}
   */
  const link = document.querySelector('link[rel~=\'icon\']');

  /**
   * Кеширование в localStorage и установка градиента
   * @function applyGradient
   * @returns {void}
   */
  const applyGradient = () => {
    localStorage.setItem('gradient', JSON.stringify(gradient));
    document.documentElement.style.setProperty('--gradient', gradient.style);
    const faviconColor = `hsl(${gradient.hue1}, ${gradient.saturation}%, 77%)`;
    const favicon = FAVICON.replace(/stroke=".*"/, `stroke="${faviconColor}"`);
    link.href = `data:image/svg+xml,${favicon}`;
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
    link.href = `data:image/svg+xml,${FAVICON.replace(/stroke=".*"/, 'stroke="black"')}`;
  }
</script>

<Switch
  --bg-color={isGradient ? undefined : gradient.style}
  aria-label="Переключить градиент"
  bind:checked={isGradient}
/>
