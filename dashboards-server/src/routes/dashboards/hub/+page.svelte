<!-- Svelte компонент -- страница с дашбордами хаба -->
<script>
  import HealthDashboard from '$lib/components/health-dashboard.svelte';
  import { isAuthenticated } from '$lib/store/is-authenticated';
</script>

{#if $isAuthenticated}
  <HealthDashboard service="hub" />
{/if}
