<!-- Svelte компонент -- страница с формой аутентификации -->
<script>
  import { enhance } from '$app/forms';
  import ThemeSwitch from '$lib/components/theme-switch.svelte';
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
  <div class="self-end flex gap-4 mr-4 md:mr-0">
    <GradientSwitch />
    <ThemeSwitch />
  </div>
  <form class="flex flex-col m-auto" method="POST" use:enhance>
    <fieldset class="fieldset">
      <legend class="fieldset-legend text-sm">Логин</legend>
      <input
        name="login"
        class="input"
        class:input-error={form?.error}
        placeholder="логин"
        required
        autocomplete="username"
      >
      {#if form?.error}
        <span class="text-sm text-error">Неверный логин или пароль</span>
      {/if}
    </fieldset>
    <fieldset class="fieldset mb-9">
      <legend class="fieldset-legend text-sm">Пароль</legend>
      <input
        name="password"
        class="input"
        class:input-error={form?.error}
        placeholder="пароль"
        required
        type="password"
        autocomplete="current-password"
      >
      {#if form?.error}
        <span class="text-sm text-error">Неверный логин или пароль</span>
      {/if}
    </fieldset>
    <button class="btn btn-primary" type="submit">Войти</button>
  </form>
{/if}
