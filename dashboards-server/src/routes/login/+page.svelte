<!-- Svelte компонент -- страница с формой аутентификации -->
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import GradientSwitcher from '$lib/components/gradient-switcher.svelte';
  import ThemeSwitcher from '$lib/components/theme-switcher.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { isAuthenticated } from '$lib/store/is-authenticated';

  /**
   * Форма аутентификации
   * @type {Record<string, any>}
   */
  export let form;

  /**
   * Аутентификация пользователя при успешном заполнении формы
   */
  $: if (form?.success) {
    isAuthenticated.set(true);
    goto('/dashboards');
  }
</script>

{#if !$isAuthenticated}
  <div class="self-end flex mr-4 md:mr-0">
    <div class="mr-4">
      <GradientSwitcher />
    </div>
    <ThemeSwitcher />
  </div>
  <form class="flex flex-col m-auto" method="POST" use:enhance>
    <div class="mb-2">
      <Label class="mb-2" for="login">Логин</Label>
      <Input
        id="login"
        name="login"
        class={form?.error ? 'border-red-600' : ''}
        placeholder="логин"
        required
        autocomplete="username"
      />
      {#if form?.error} <span class="text-sm text-red-600">Неверный логин или пароль</span> {/if}
    </div>
    <div class="mb-9">
      <Label class="mb-2" for="password">Пароль</Label>
      <Input
        id="password"
        name="password"
        class={form?.error ? 'border-red-600' : ''}
        placeholder="пароль"
        required
        type="password"
        autocomplete="current-password"
      />
      {#if form?.error} <span class="text-sm text-red-600">Неверный логин или пароль</span> {/if}
    </div>
    <Button type="submit">Войти</Button>
  </form>
{/if}
