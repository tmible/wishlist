<!-- @component Общая для страниц с дашбордами разметка -->
<script>
  import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import { Chart } from 'chart.js/auto';
  import annotationPlugin from 'chartjs-plugin-annotation';
  import { page } from '$app/state';
  import ThemeSwitch from '$lib/components/theme-switch.svelte';
  import {
    NetworkFactory as DashboardNetworkFactory,
    StoreFactory as DashboardStoreFactory,
  } from '$lib/dashboard/injection-tokens.js';
  import { createGetData } from '$lib/dashboard/network.service.js';
  import { createStore as dashboardStoreFactory } from '$lib/dashboard/store.js';
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

  // Регистрация плагина аннотаций в chart.js
  Chart.register(annotationPlugin);

  // Регистрация фабрик дашборда в сервисе внедрения зависмостей
  provide(DashboardStoreFactory, dashboardStoreFactory);
  provide(DashboardNetworkFactory, createGetData);

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
    path: '/dashboards/hub',
    label: 'Хаб',
    healthKey: 'hub',
  }];
</script>

{#if $user.isAuthenticated}
  <div class="mb-9 flex items-center justify-between mx-4 md:mx-0">
    <div class="plate flex items-center gap-4 py-2 px-4">
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
    <div class="flex items-center gap-4">
      <GradientSwitch />
      <ThemeSwitch />
      <button class="btn btn-secondary btn-sm shadow-sm" onclick={() => logout(true)}>Выйти</button>
    </div>
  </div>
  {@render children?.()}
{/if}
