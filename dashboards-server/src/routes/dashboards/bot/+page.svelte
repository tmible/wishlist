<!-- Svelte компонент -- страница с дашбордами бота -->
<script>
  import * as Card from '$lib/components/ui/card';
  import UserSessionsTable from '$lib/components/user-sessions-table';
  import { PERIOD } from '$lib/constants/period.const.js';
  import Dashboard from '$lib/dashboard/dashboard.svelte';
  import HealthDashboard from '$lib/health/dashboard.svelte';
  import { user } from '$lib/user/store.js';

  /** @typedef {import('$lib/dashboard/domain.js').DashboardData} DashboardData */
  /** @typedef {import('$lib/components/user-sessions-table').TableData} TableData */

  /**
   * @typedef {object} Props
   * @property {{
   *   time: DashboardData;
   *   activeUsers: DashboardData;
   *   successRate: DashboardData;
   *   userSessions: TableData[];
   * }} data Данные для дашбордов
   */

  /** @type {Props} */
  const { data } = $props();
</script>

{#if $user.isAuthenticated}
  <HealthDashboard service="bot" />
  <div class="dashboards grid gap-6 grid-cols-1 xl:grid-cols-2 mb-9">
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <Dashboard
          service="bot"
          config={{
            key: 'time',
            type: 'line',
            initialData: data.time,
            chartConfigs: [{
              key: 'responseTime',
              label: 'Время ответа',
            }, {
              key: 'processTime',
              label: 'Время обработки обновления',
            }, {
              key: 'startupTime',
              label: 'Время до начала ответа',
            }],
          }}
        />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <Dashboard
          service="bot"
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
          service="bot"
          config={{
            key: 'successRate',
            type: 'doughnut',
            initialData: data.successRate,
            label: [ 'Success rate' ],
          }}
        />
      </Card.Content>
    </Card.Root>
  </div>
  <UserSessionsTable data={data.userSessions} />
{/if}
