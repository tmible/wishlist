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
  import { user } from '$lib/store/user';

  /**
   * Регистрация сервиса управления темой в сервисе внедрения зависмостей
   */
  provide(InjectionToken.ThemeService, { isDarkTheme, subscribeToTheme, updateTheme });

  /**
   * В браузере проверка аутентифицированностии пользователя и его
   * перенаправление на соответствующую статусу аутентификации страницу
   */
  $: if (browser && $user.isAuthenticated !== null) {
    if (!$user.isAuthenticated && $page.url.pathname.startsWith('/list')) {
      goto('/');
    } else if ($user.isAuthenticated && $page.url.pathname === '/') {
      goto('/list');
    }
  }

  /**
   * Запрос статуса аутентификации пользователя
   */
  onMount(async () => {
    user.set(
      await fetch('/api/user').then((response) => response.json()),
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
    })();
  </script>
  <!-- eslint-enable svelte/indent -->
</svelte:head>

{#if $user.isAuthenticated !== null}
  <slot />
{/if}
