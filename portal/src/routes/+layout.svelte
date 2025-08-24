<!-- @component Общая для всех страниц разметка -->
<script>
  import '../app.css';
  import { inject } from '@tmible/wishlist-common/dependency-injector';
  import { initThemeFeature } from '@tmible/wishlist-ui/theme/initialization';
  import { ThemeService } from '@tmible/wishlist-ui/theme/injection-tokens';
  import { onDestroy, onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { initActionsFeature } from '$lib/actions/initialization.js';
  import Background from '$lib/components/background.svelte';
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
    if ($user.isAuthenticated !== null && page.url.pathname !== '/add') {
      if (!$user.isAuthenticated && page.url.pathname.startsWith('/list')) {
        goto('/');
      } else if ($user.isAuthenticated && page.url.pathname === '/') {
        goto('/list');
      }
    }
  });

  // Запрос статуса аутентификации пользователя, инициализация Svelte хранилища темы
  onMount(() => {
    const destroyTheme = inject(ThemeService).initTheme();
    initialize();
    return destroyTheme;
  });

  onDestroy(() => {
    destoryThemeFeature();
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

      const themeBits = fromLocalStorage?.themeName?.split('-') ?? [];
      if (themeBits.length === 0) {
        themeBits.push(fromWindow ? 'dark' : 'light');
      }
      if (themeBits.length === 1) {
        themeBits.unshift('blossom');
      }
      if (fromLocalStorage?.windowPrefersDark !== fromWindow) {
        themeBits[1] = fromWindow ? 'dark' : 'light';
      }
      const theme = themeBits.join('-');

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

<Background>
  {#if $user.isAuthenticated !== null}
    {@render children?.()}
  {/if}
</Background>
