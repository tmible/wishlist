<!-- Svelte компонент -- общая для всех страниц разметка -->
<script>
  import '../app.pcss';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import {
    initTheme,
    isDarkTheme,
    subscribeToTheme,
    updateTheme,
  } from '@tmible/wishlist-common/theme-service';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { InjectionToken } from '$lib/architecture/injection-token';
  import { user } from '$lib/store/user';
  import { initUnknownUserUuid } from '$lib/unknown-user-uuid';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  // Регистрация сервиса управления темой в сервисе внедрения зависмостей
  provide(InjectionToken.ThemeService, { isDarkTheme, subscribeToTheme, updateTheme });

  // Инициализация идентификатора неаутентифицированного пользователя
  initUnknownUserUuid();

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $effect(() => {
    if ($user.isAuthenticated !== null) {
      if (!$user.isAuthenticated && $page.url.pathname.startsWith('/list')) {
        goto('/');
      } else if ($user.isAuthenticated && $page.url.pathname === '/') {
        goto('/list');
      }
    }
  });

  /**
   * Запрос статуса аутентификации пользователя, инициализация Svelte хранилища темы
   */
  onMount(async () => {
    user.set({
      ...$user,
      ...await fetch('/api/user').then((response) => response.json()),
    });
    initTheme();
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
    })();
  </script>
  <!-- eslint-enable svelte/indent -->
</svelte:head>

{#if $user.isAuthenticated !== null}
  {@render children?.()}
{/if}
