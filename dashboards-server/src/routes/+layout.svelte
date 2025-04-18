<!-- Svelte компонент -- общая для всех страниц разметка -->
<script>
  import '../app.pcss';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import { subscribe } from '@tmible/wishlist-common/event-bus';
  import {
    initTheme,
    isDarkTheme,
    subscribeToTheme,
    updateTheme,
  } from '@tmible/wishlist-common/theme-service';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ThemeService } from '$lib/theme-service-injection-token.js';
  import { Navigate } from '$lib/user/events.js';
  import {
    NetworkService as UserNetworkService,
    Store as UserStore,
  } from '$lib/user/injection-tokens.js';
  import * as userNetworkService from '$lib/user/network.service.js';
  import { user } from '$lib/user/store.js';
  import { checkAuthentication } from '$lib/user/use-cases/check-authentication.js';

  // Регистрация сервиса управления темой в сервисе внедрения зависмостей
  provide(ThemeService, { isDarkTheme, subscribeToTheme, updateTheme });

  // Регистрация зависисмостей и подписка на события для работы с пользователем
  provide(UserStore, user);
  provide(UserNetworkService, userNetworkService);
  subscribe(
    Navigate,
    (route) => {
      if ($page.url.pathname.startsWith(route)) {
        return;
      }
      goto(route);
    },
  );

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $: if (browser && $user.isAuthenticated !== null) {
    if (!$user.isAuthenticated && $page.url.pathname.startsWith('/dashboards')) {
      goto('/login');
    } else if ($user.isAuthenticated && $page.url.pathname === '/login') {
      goto('/dashboards');
    }
  }

  // Инициализация темы, pапрос статуса аутентификации пользователя
  onMount(async () => {
    initTheme();
    await checkAuthentication();
  });
</script>

<svelte:head>
  <!-- eslint-disable svelte/indent -- Всё как должно быть -->
  <script>
    (() => {
      let fromLocalStorage = localStorage.getItem('theme');
      // TODO временное решение для поддержки старого формата хранения темы
      try {
        fromLocalStorage = JSON.parse(fromLocalStorage);
      } catch(e) {
        if (!/Unexpected token '.', ".+" is not valid JSON/.test(e.message)) {
          throw e;
        }
      }
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
  <slot></slot>
{/if}
