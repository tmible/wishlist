<!-- @component Страница с дашбордами сервисов, кроме бота и портала -->
<script>
  import HealthDashboard from '$lib/health/dashboard.svelte';
  import { user } from '$lib/user/store.js';
</script>

{#if $user.isAuthenticated}
  <div class="plate flex flex-grow flex-col gap-3 mb-6 p-3 md:p-6">
    <h2 class="text-lg font-bold">Хаб</h2>
    <HealthDashboard service="hub" />
  </div>
  <div class="plate flex flex-col gap-3 p-3 md:p-6">
    <h2 class="text-lg font-bold">Сервис удаления протухших refresh токенов</h2>
    <HealthDashboard service="refreshTokensCleaner" />
  </div>
{/if}
