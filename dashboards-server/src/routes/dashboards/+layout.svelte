<!-- @component Общая для страниц с дашбордами разметка -->
<script>
  import ScrollArea from '@tmible/wishlist-ui/scroll-area';
  import ThemeSwitch from '@tmible/wishlist-ui/theme/switch';
  import { onDestroy } from 'svelte';
  import { page } from '$app/state';
  import { initDashboardFeature } from '$lib/dashboard/initialization.js';
  import GradientSwitch from '$lib/gradient/switch.svelte';
  import HealthIndicator from '$lib/health/indicator.svelte';
  import { user } from '$lib/user/store.js';
  import { logout } from '$lib/user/use-cases/logout.js';

  /**
   * @typedef {object} Props
   * @property {import('svelte').Snippet} [children] Дочерние компоненты
   */

  /** @type {Props} */
  const { children } = $props();

  /**
   * Меню для навигации по дашбордам сервисов
   */
  const navigationMenu = [{
    path: '/dashboards/bot',
    label: 'Бот',
    healthKey: 'bot',
  }, {
    path: '/dashboards/portal',
    label: 'Портал',
    healthKey: 'portal',
  }, {
    path: '/dashboards/other',
    label: 'Остальное',
    healthKey: 'other',
  }];

  /**
   * Регистрация зависисмостей для работы с дашбордами
   * Функция освобождения зависимостей
   * @type {() => void}
   */
  const destroyDashboardFeature = initDashboardFeature();

  onDestroy(() => {
    destroyDashboardFeature();
  });
</script>

{#if $user.isAuthenticated}
  <ScrollArea viewportClasses="flex flex-col max-h-dvh w-full h-hull m-0 py-9 px-1 md:px-9">
    <div class="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mb-9">
      <div class="plate w-full md:w-auto flex items-center gap-4 py-2 px-4">
        {#each navigationMenu as { path, label, healthKey } (healthKey)}
          <a
            class={(
            page.url.pathname.endsWith(path) ?
              'flex items-center gap-1 text-base-content hover:text-base-content' :
              'flex items-center gap-1 text-base-content/50 hover:text-base-content'
            )}
            href={path}
          >
            <HealthIndicator service={healthKey} />
            {label}
          </a>
        {/each}
      </div>
      <div class="flex items-center gap-4 self-end mx-4 md:mx-0">
        <GradientSwitch />
        <ThemeSwitch />
        <button class="btn btn-secondary btn-sm shadow-sm" onclick={() => logout(true)}>
          Выйти
        </button>
      </div>
    </div>
    {@render children?.()}
  </ScrollArea>
{/if}
