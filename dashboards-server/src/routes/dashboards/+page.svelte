<!-- Svelte компонент -- страница с дашбордами -->
<script>
  import { goto } from '$app/navigation';
  import GradientSwitcher from '$lib/components/gradient-switcher.svelte';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  /* eslint-disable-next-line import/default, import/no-named-as-default,
    import/no-named-as-default-member -- Понятия не имею, в чём проблема */
  import UserSessionsTable from '$lib/components/user-sessions-table';
  import { post } from '$lib/post';
  import { isAuthenticated } from '$lib/store/is-authenticated';
  import ActiveUsersDashboard from './active-users-dashboard.svelte';
  import SuccessRateDashboard from './success-rate-dashboard.svelte';
  import TimeDashboard from './time-dashboard.svelte';

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

  /**
   * Разлогинивание пользователя
   * @function logout
   * @returns {Promise<void>}
   * @async
   */
  const logout = async () => {
    const response = await post('/api/logout');
    if (response.ok) {
      isAuthenticated.set(false);
      goto('/login');
    }
  };
</script>

{#if $isAuthenticated}
  <div class="self-end mb-9 flex items-center mr-4 md:mr-0">
    <div class="mr-4">
      <GradientSwitcher />
    </div>
    <div class="mr-4">
      <ThemeSwitcher />
    </div>
    <Button variant="secondary" on:click={logout}>Выйти</Button>
  </div>
  <div class="dashboards grid gap-6 grid-cols-1 xl:grid-cols-2 mb-9">
    <style>
      @media (min-width: 1280px) {
        .dashboards > *:nth-last-child(1):nth-child(even) {
          width: calc(200% + 1.5rem);
        }
      }
    </style>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <TimeDashboard data={data.timeDashboard} />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <ActiveUsersDashboard data={data.activeUsersDashboard} />
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="pt-3 md:pt-6">
        <SuccessRateDashboard data={data.successRate} />
      </Card.Content>
    </Card.Root>
  </div>
  <UserSessionsTable data={data.userSessions} />
{/if}
