<!-- @component Десктопное меню портала -->
<script>
  import { DropdownMenu } from 'bits-ui';
  import { cubicOut } from 'svelte/easing';

  /** @typedef {import('./menu.svelte').MenuItem} MenuItem */

  /**
   * @typedef {object} Props
   * @property {boolean} [isMenuHidden] Признак необходимости спрятать меню
   * @property {MenuItem[]} options Пункты меню
   */

  /** @type {Props} */
  const { isMenuHidden = false, options } = $props();

  /**
   * Фунция svelte transition
   * @function flyAndScale
   * @returns {import('svelte/transition').TransitionConfig} Параметры transition
   * @see {@link https://svelte.dev/docs/svelte-transition}
   */
  const flyAndScale = () => ({
    duration: 100,
    easing: cubicOut,
    css: (t, u) => `opacity: ${t}; transform: translateY(${u * 25}%)`,
  });
</script>

{#snippet MenuItem({ icon, label })}
  {@const Icon = icon}
  <li>
    <span>
      <Icon class="w-5 h-5" />
      {label}
    </span>
  </li>
{/snippet}

{#snippet MenuItemWrapper({ href, target, testId, children })}
  {#if href}
    <a {href} {target} data-testid={testId}>
      {@render children()}
    </a>
  {:else}
    {@render children({ testId })}
  {/if}
{/snippet}

<div
  class="fixed bottom-0 right-6 transition-transform hidden md:block"
  class:bottom-6={!isMenuHidden}
  class:translate-y-[100%]={isMenuHidden}
  class:invisible={isMenuHidden}
>
  <ul class="shadow-xl menu bg-base-100 rounded-box">
    {#each
      options as { icon, label, testId, children, onClick, href, target, condition = true }
      (label)}
      {#if condition}
        {#if children}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger data-testid={testId}>
              {@render MenuItem({ icon, label })}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              class="shadow-xl menu bg-base-100 rounded-box"
              sideOffset={16}
              strategy="fixed"
              transition={flyAndScale}
              side="left"
            >
              {#each children as { icon, label, testId, onClick, href, target } (label)}
                {#snippet Item({ testId })}
                  <DropdownMenu.Item data-testid={testId} onclick={onClick}>
                    {@render MenuItem({ icon, label })}
                  </DropdownMenu.Item>
                {/snippet}
                {@render MenuItemWrapper({ testId, href, target, children: Item })}
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {:else}
          {#snippet Button({ testId })}
            <button class="w-full" data-testid={testId} onclick={onClick}>
              {@render MenuItem({ icon, label })}
            </button>
          {/snippet}
          {@render MenuItemWrapper({ testId, href, target, children: Button })}
        {/if}
      {/if}
    {/each}
  </ul>
</div>
