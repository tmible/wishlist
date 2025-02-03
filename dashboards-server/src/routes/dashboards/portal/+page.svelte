<!-- Svelte компонент -- страница с дашбордами портала -->
<script>
  import HealthDashboard from '$lib/components/health-dashboard.svelte';
  import * as Card from '$lib/components/ui/card';
  import { isAuthenticated } from '$lib/store/is-authenticated';
  import ActiveUsersDashboard from '../active-users-dashboard.svelte';
  import SuccessRateDashboard from '../success-rate-dashboard.svelte';
  import TimeDashboard from '../time-dashboard.svelte';

  /** @typedef {import('$lib/components/dashboard.svelte').DashboardChart} DashboardChart */

  /**
   * Данные для дашбордов
   * @type {{
   *   timeDashboard: DashboardChart[];
   *   activeUsersDashboard: DashboardChart[];
   *   successRate: number;
   *   authenticationFunnel: number;
   * }}
   */
  export let data;
</script>

{#if $isAuthenticated}
  <HealthDashboard service="portal" />
  <div class="dashboards grid gap-6 grid-cols-1 xl:grid-cols-2 mb-9">
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <TimeDashboard data={data.timeDashboard} service="portal" />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <ActiveUsersDashboard data={data.activeUsersDashboard} service="portal" />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <SuccessRateDashboard data={data.successRate} service="portal" />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6 h-full flex items-center justify-center">
        Воронка авторизации:
        {data.authenticationFunnel ? `${(data.authenticationFunnel * 100).toFixed(2)}%` : ''}
      </Card.Content>
    </Card.Root>
  </div>
{/if}
