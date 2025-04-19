<!-- Svelte компонент -- страница с формой аутентификации -->
<script>
  import { enhance } from '$app/forms';
  import ThemeSwitch from '$lib/components/theme-switch.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import GradientSwitch from '$lib/gradient/switch.svelte';
  import { user } from '$lib/user/store.js';
  import { login } from '$lib/user/use-cases/login.js';

  /**
   * @typedef {object} Props
   * @property {Record<string, any>} form Форма аутентификации
   */

  /** @type {Props} */
  const { form } = $props();

  // Аутентификация пользователя при успешном заполнении формы
  $effect(() => {
    if (form?.success) {
      login();
    }
  });
</script>

{#if !$user.isAuthenticated}
  <div class="self-end flex mr-4 md:mr-0">
    <div class="mr-4">
      <GradientSwitch />
    </div>
    <ThemeSwitch />
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
