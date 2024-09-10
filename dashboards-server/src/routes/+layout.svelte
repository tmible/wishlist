<!-- Svelte компонент -- общая для всех страниц разметка -->
<script>
  import '../app.pcss';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import {
    isDarkTheme,
    subscribeToTheme,
    updateTheme,
  } from '@tmible/wishlist-common/theme-service';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { InjectionToken } from '$lib/architecture/injection-token';
  import { isAuthenticated } from '$lib/store/is-authenticated';

  /**
   * Регистрация сервиса управления темой в сервисе внедрения зависмостей
   */
  provide(InjectionToken.ThemeService, { isDarkTheme, subscribeToTheme, updateTheme });

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $: if (browser && $isAuthenticated !== null) {
    if (!$isAuthenticated && $page.url.pathname === '/dashboards') {
      goto('/login');
    } else if ($isAuthenticated && $page.url.pathname === '/login') {
      goto('/dashboards');
    }
  }

  /**
   * Запрос статуса аутентификации пользователя
   */
  onMount(async () => {
    isAuthenticated.set(
      await fetch('/api/isAuthenticated').then((response) => response.json()),
    );
  });
</script>

<svelte:head>
  <!-- eslint-disable svelte/indent -- Всё как должно быть -->
  <script>
    (() => {
      const theme = localStorage.getItem('theme') ?? (
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ?
          'dark' :
          'light'
      );
      localStorage.setItem('theme', theme);
      document.documentElement.dataset.theme = theme;

      const gradient = JSON.parse(localStorage.getItem('gradient'))?.style;
      if (gradient) {
        document.documentElement.style.setProperty('--gradient', gradient);
      }
    })();
  </script>
  <!-- eslint-enable svelte/indent -->
</svelte:head>

{#if $isAuthenticated !== null}
  <slot />
{/if}
