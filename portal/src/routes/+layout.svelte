<!-- @component Общая для всех страниц разметка -->
<script>
  import '../app.css';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import {
    initTheme,
    isDarkTheme,
    subscribeToTheme,
    updateTheme,
  } from '@tmible/wishlist-common/theme-service';
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { initActionsFeature } from '$lib/actions/initialization.js';
  import { AUTHENTICATED_ROUTE } from '$lib/constants/authenticated-route.const.js';
  import { UNAUTHENTICATED_ROUTE } from '$lib/constants/unauthenticated-route.const.js';
  import { ThemeService } from '$lib/theme-service-injection-token.js';
  import { initUnknownUserUuid } from '$lib/unknown-user-uuid';
  import { initUserFeature } from '$lib/user/initialization.js';
  import { user } from '$lib/user/store.js';
  import { initialize } from '$lib/user/use-cases/initialize.js';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  // Регистрация сервиса управления темой в сервисе внедрения зависмостей
  provide(ThemeService, { isDarkTheme, subscribeToTheme, updateTheme });

  /**
   * Регистрация зависисмостей и подписка на события для работы с пользователем
   * Функция освобождения зависимостей и отписки от событий
   * @type {() => void}
   */
  const destroyUserFeature = initUserFeature();

  /**
   * Регистрация зависисмостей для работы с действиями
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroyActionsFeature = initActionsFeature();

  // Инициализация идентификатора неаутентифицированного пользователя
  initUnknownUserUuid();

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $effect(() => {
    if ($user.isAuthenticated !== null) {
      if (!$user.isAuthenticated && page.url.pathname.startsWith(AUTHENTICATED_ROUTE)) {
        goto(UNAUTHENTICATED_ROUTE);
      } else if ($user.isAuthenticated && page.url.pathname === UNAUTHENTICATED_ROUTE) {
        goto(AUTHENTICATED_ROUTE);
      }
    }
  });

  // Запрос статуса аутентификации пользователя, инициализация Svelte хранилища темы
  onMount(() => {
    const destroyTheme = initTheme();
    initialize();
    return destroyTheme;
  });

  onDestroy(() => {
    destroyUserFeature();
    destroyActionsFeature();
  });
</script>

<svelte:head>
  <!-- eslint-disable svelte/indent -- Всё как должно быть -->
  <script>
    (() => {
      const fromLocalStorage = JSON.parse(localStorage.getItem('theme'));
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
    })();
  </script>
  <!-- eslint-enable svelte/indent -->
</svelte:head>

{#if $user.isAuthenticated !== null}
  {@render children?.()}
{/if}
