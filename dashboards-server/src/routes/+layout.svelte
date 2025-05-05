<!-- @component Общая для всех страниц разметка -->
<script>
  import '../app.css';
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { initThemeFeature } from '@tmible/wishlist-ui/theme/initialization';
  import { ThemeService } from '@tmible/wishlist-ui/theme/injection-tokens';
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { initUserFeature } from '$lib/user/initialization.js';
  import { user } from '$lib/user/store.js';
  import { checkAuthentication } from '$lib/user/use-cases/check-authentication.js';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /*
   * Регистрация зависисмостей для работы с темой
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destoryThemeFeature = initThemeFeature();

  /**
   * Регистрация зависисмостей и подписка на события для работы с пользователем
   * Функция освобождения зависимостей и отписки от событий
   * @type {() => void}
   */
  const destroyUserFeature = initUserFeature();

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $effect(() => {
    if (browser && $user.isAuthenticated !== null) {
      if (!$user.isAuthenticated && page.url.pathname.startsWith('/dashboards')) {
        goto('/login');
      } else if ($user.isAuthenticated && page.url.pathname === '/login') {
        goto('/dashboards');
      }
    }
  });

  // Инициализация темы, запрос статуса аутентификации пользователя
  onMount(() => {
    const destroyTheme = inject(ThemeService).initTheme();
    checkAuthentication();
    return destroyTheme;
  });

  onDestroy(() => {
    destoryThemeFeature();
    destroyUserFeature();
  });
</script>

<svelte:head>
  <!-- eslint-disable svelte/indent -- Всё как должно быть -->
  <script>
    (() => {
      let fromLocalStorage = JSON.parse(localStorage.getItem('theme'));
      const fromWindow = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let theme;

      if (fromLocalStorage?.windowPrefersDark === fromWindow && fromLocalStorage?.themeName) {
        theme = fromLocalStorage.themeName;
      } else {
        theme = fromWindow ? 'dark' : 'light';
      }

      localStorage.setItem(
        'theme',
        JSON.stringify({
          windowPrefersDark: fromWindow,
          themeName: theme,
        }),
      );
      document.documentElement.dataset.theme = theme;

      const gradient = JSON.parse(localStorage.getItem('gradient'))?.style;
      if (gradient) {
        document.documentElement.style.setProperty('--gradient', gradient);
      }
    })();
  </script>
  <!-- eslint-enable svelte/indent -->
</svelte:head>

{#if $user.isAuthenticated !== null}
  {@render children?.()}
{/if}
