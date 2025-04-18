<!-- Svelte компонент -- страница с дашбордами портала -->
<script>
  import * as Card from '$lib/components/ui/card';
  import { PERIOD } from '$lib/constants/period.const.js';
  import Dashboard from '$lib/dashboard/dashboard.svelte';
  import HealthDashboard from '$lib/health/dashboard.svelte';
  import { user } from '$lib/user/store.js';

  /** @typedef {import('$lib/dashboard/domain.js').DashboardData} DashboardData */

  /**
   * Данные для дашбордов
   * @type {{
   *   time: DashboardData;
   *   activeUsers: DashboardData;
   *   successRate: DashboardData;
   *   authenticationFunnel: DashboardData;
   * }}
   */
  export let data;
</script>

{#if $user.isAuthenticated}
  <HealthDashboard service="portal" />
  <div class="dashboards grid gap-6 grid-cols-1 xl:grid-cols-2 mb-9">
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
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
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
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
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <Dashboard
          service="portal"
          config={{
            key: 'successRate',
            type: 'doughnut',
            initialData: data.successRate,
            label: [ 'Success rate' ],
          }}
        />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <Dashboard
          service="portal"
          config={{
            key: 'authenticationFunnel',
            type: 'doughnut',
            initialData: data.authenticationFunnel,
            label: [ 'Воронка', 'аутентификации' ],
          }}
        />
      </Card.Content>
    </Card.Root>
  </div>
{/if}
