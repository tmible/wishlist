<!-- Svelte компонент -- общая для страниц с дашбордами разметка -->
<script>
  import { post } from '@tmible/wishlist-common/post';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import GradientSwitcher from '$lib/components/gradient-switcher.svelte';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { ERROR_COLOR } from '$lib/constants/error-color.const.js';
  import { SUCCESS_COLOR } from '$lib/constants/success-color.const.js';
  import { healthData } from '$lib/store/health-data.js';
  import { isAuthenticated } from '$lib/store/is-authenticated';

  /**
   * Меню для навигации по дашбордам сервисов
   */
  const navigationMenu = [{
    path: '/dashboards/bot',
    label: 'Бот',
    healthKey: 'bot',
  }, {
    path: '/dashboards/portal',
    label: 'Портал',
    healthKey: 'portal',
  }, {
    path: '/dashboards/hub',
    label: 'Хаб',
    healthKey: 'hub',
  }];

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
  <!-- eslint-disable svelte/no-inline-styles --
    Нужны цвета из переменных, которые используются в других местах в коде -->
  <div
    style:--success-color={SUCCESS_COLOR}
    style:--warning-color="#ffbc42"
    style:--error-color={ERROR_COLOR}
    style:--undefined-color="#5a5a66"
    class="constents"
  >
    <!-- eslint-enable svelte/no-inline-styles -->
    <div class="mb-9 flex items-center justify-between mx-4 md:mx-0">
      <Card.Root>
        <Card.Content class="flex items-center gap-4 py-2 md:py-2 px-4 md:px-4">
          {#each navigationMenu as { path, label, healthKey } (healthKey)}
            <a
              class="
                flex
                items-center
                gap-1
                hover:text-foreground
                transition-colors
              "
              class:text-muted-foreground={!$page.url.pathname.endsWith(path)}
              class:text-foreground={$page.url.pathname.endsWith(path)}
              href={path}
            >
              {#if $healthData.date}
                <div
                  class="w-2 h-2 rounded-full"
                  class:success-bg={!Object.values($healthData[healthKey]).some((value) => !value)}
                  class:warning-bg={Object.values($healthData[healthKey]).some(Boolean) &&
                    Object.values($healthData[healthKey]).some((value) => !value)}
                  class:error-bg={!Object.values($healthData[healthKey]).some(Boolean)}
                />
              {/if}
              {label}
            </a>
          {/each}
        </Card.Content>
      </Card.Root>
      <div class="flex items-center gap-4">
        <GradientSwitcher />
        <ThemeSwitcher />
        <Button variant="secondary" on:click={logout}>Выйти</Button>
      </div>
    </div>
    <slot />
  </div>
{/if}
