<!-- @component Страница с дашбордами портала -->
<script>
  import GridScalePlate from '$lib/components/grid-scale-plate.svelte';
  import { PERIOD } from '$lib/constants/period.const.js';
  import Dashboard from '$lib/dashboard/dashboard.svelte';
  import HealthDashboard from '$lib/health/dashboard.svelte';
  import { user } from '$lib/user/store.js';

  /** @typedef {import('$lib/dashboard/domain.js').DashboardData} DashboardData */

  /**
   * @typedef {object} Props
   * @property {{
   *   time: DashboardData;
   *   activeUsers: DashboardData;
   *   successRate: DashboardData;
   *   authenticationFunnel: DashboardData;
   * }} data Данные для дашбордов
   */

  /** @type {Props} */
  const { data } = $props();
</script>

{#if $user.isAuthenticated}
  <HealthDashboard service="portal" />
  <div class="dashboards flex flex-wrap -m-3 mb-9">
    <GridScalePlate>
      <Dashboard
        service="portal"
        config={{
          key: 'rps',
          type: 'line',
          initialData: data.rps,
          chartConfigs: [{
            key: 'rps',
            label: 'Запросов в секунду',
          }],
        }}
      />
    </GridScalePlate>
    <GridScalePlate>
      <Dashboard
        service="portal"
        config={{
          key: 'time',
          type: 'line',
          initialData: data.time,
          chartConfigs: [{
            key: 'responseTime',
            label: 'Время ответа',
          }],
        }}
      />
    </GridScalePlate>
    <GridScalePlate>
      <Dashboard
        service="portal"
        config={{
          key: 'activeUsers',
          type: 'line',
          period: PERIOD.WEEK,
          initialData: data.activeUsers,
          chartConfigs: [{
            key: 'dau',
            label: 'Уникальные пользователи за сутки',
          }, {
            key: 'mau',
            label: 'Уникальные пользователи за месяц',
          }, {
            key: 'yau',
            label: 'Уникальные пользователи за год',
          }],
        }}
      />
    </GridScalePlate>
    <GridScalePlate>
      <Dashboard
        service="portal"
        config={{
          key: 'successRate',
          type: 'doughnut',
          initialData: data.successRate,
          label: [ 'Success rate' ],
        }}
      />
    </GridScalePlate>
    <GridScalePlate>
      <Dashboard
        service="portal"
        config={{
          key: 'authenticationFunnel',
          type: 'doughnut',
          initialData: data.authenticationFunnel,
          label: [ 'Воронка', 'аутентификации' ],
        }}
      />
    </GridScalePlate>
  </div>
{/if}
