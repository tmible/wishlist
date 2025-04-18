<!-- Svelte компонент -- общая для страниц с дашбордами разметка -->
<script>
  import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
  import { provide } from '@tmible/wishlist-common/dependency-injector';
  import { Chart } from 'chart.js/auto';
  import annotationPlugin from 'chartjs-plugin-annotation';
  import { page } from '$app/stores';
  import ThemeSwitch from '$lib/components/theme-switch.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
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
    <Card.Root>
      <Card.Content class="flex items-center gap-4 py-2 md:py-2 px-4 md:px-4">
        {#each navigationMenu as { path, label, healthKey } (healthKey)}
          <a
            class="flex items-center gap-1 hover:text-foreground transition-colors"
            class:text-muted-foreground={!$page.url.pathname.endsWith(path)}
            class:text-foreground={$page.url.pathname.endsWith(path)}
            href={path}
          >
            <HealthIndicator service={healthKey} />
            {label}
          </a>
        {/each}
      </Card.Content>
    </Card.Root>
    <div class="flex items-center gap-4">
      <GradientSwitch />
      <ThemeSwitch />
      <Button variant="secondary" on:click={() => logout(true)}>Выйти</Button>
    </div>
  </div>
  <slot></slot>
{/if}
