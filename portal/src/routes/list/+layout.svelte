<!-- @component Общая для всех страниц авторизованной зоны разметка -->
<script>
  import { onDestroy, setContext } from 'svelte';
  import { initCategoriesFeature } from '$lib/categories/initialization.js';
  import { user } from '$lib/user/store.js';
  import { initWishlistFeature } from '$lib/wishlist/initialization.js';
  import { getList } from '$lib/wishlist/use-cases/get-list.js';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /**
   * Регистрация зависисмостей для работы со списком желаний
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroyWishlistFeature = initWishlistFeature();

  /**
   * Регистрация зависисмостей для работы с категориями
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroyCategoriesFeature = initCategoriesFeature();

  // Получение списка желаний пользователя
  setContext('get wishlist promise', getList());

  onDestroy(() => {
    destroyWishlistFeature();
    destroyCategoriesFeature();
  });
</script>

{#if $user.isAuthenticated}
  {@render children?.()}
{/if}
