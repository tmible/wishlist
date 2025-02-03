<!-- Svelte компонент -- страница с дашбордами бота -->
<script>
  import HealthDashboard from '$lib/components/health-dashboard.svelte';
  import * as Card from '$lib/components/ui/card';
  import UserSessionsTable from '$lib/components/user-sessions-table';
  import { isAuthenticated } from '$lib/store/is-authenticated';
  import ActiveUsersDashboard from '../active-users-dashboard.svelte';
  import SuccessRateDashboard from '../success-rate-dashboard.svelte';
  import TimeDashboard from '../time-dashboard.svelte';

  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */
  /** @typedef {import('$lib/components/user-sessions-table').TableData} TableData */

  /**
   * Данные для дашбордов
   * @type {{
   *   timeDashboard: DashboardChart[];
   *   activeUsersDashboard: DashboardChart[];
   *   successRate: number;
   *   userSessions: TableData[];
   * }}
   */
  export let data;
</script>

{#if $isAuthenticated}
  <HealthDashboard service="bot" />
  <div class="dashboards grid gap-6 grid-cols-1 xl:grid-cols-2 mb-9">
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <TimeDashboard data={data.timeDashboard} service="bot" />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <ActiveUsersDashboard data={data.activeUsersDashboard} service="bot" />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <SuccessRateDashboard data={data.successRate} service="bot" />
      </Card.Content>
    </Card.Root>
  </div>
  <UserSessionsTable data={data.userSessions} />
{/if}
