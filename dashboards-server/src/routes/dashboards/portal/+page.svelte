<!-- Svelte компонент -- страница с дашбордами портала -->
<script>
  import HealthDashboard from '$lib/components/health-dashboard.svelte';
  import { isAuthenticated } from '$lib/store/is-authenticated';
</script>

{#if $isAuthenticated}
  <HealthDashboard service="portal" />
{/if}
