<!-- Svelte компонент -- страница с дашбордами хаба -->
<script>
  import HealthDashboard from '$lib/health/dashboard.svelte';
  import { user } from '$lib/user/store.js';
</script>

{#if $user.isAuthenticated}
  <HealthDashboard service="hub" />
{/if}
