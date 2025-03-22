<!-- Svelte компонент -- десктопное меню портала -->
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

<div
  class="fixed bottom-0 transition-transform floating-menu hidden md:block"
  class:mb-6={!isMenuHidden}
  class:mr-6={!isMenuHidden}
  class:translate-y-[100%]={isMenuHidden}
>
  <ul class="shadow-xl menu bg-base-100 rounded-box">
    {#each options as { icon, label, testId, children, onClick, condition = true } (label)}
      {#if condition}
        {#if children}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger data-testid={testId}>
              {@const Icon = icon}
              <li>
                <span>
                  <Icon class="w-5 h-5" />
                  {label}
                </span>
              </li>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              class="shadow-xl menu bg-base-100 rounded-box"
              sideOffset={16}
              strategy="fixed"
              transition={flyAndScale}
              side="left"
            >
              {#each children as { icon, label, testId, onClick } (label)}
                <DropdownMenu.Item
                  data-testid={testId}
                  onclick={(event) => onClick(event, event.currentTarget)}
                >
                  {@const Icon = icon}
                  <li>
                    <span>
                      <Icon class="w-5 h-5" />
                      {label}
                    </span>
                  </li>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {:else}
          {@const Icon = icon}
          <button data-testid={testId} onclick={onClick}>
            <li>
              <span>
                <Icon class="w-5 h-5" />
                {label}
              </span>
            </li>
          </button>
        {/if}
      {/if}
    {/each}
  </ul>
</div>

<style>
  @reference "../../app.css";

  @keyframes success {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%);
    }
    50% {
      opacity: 0.75;
      transform: translate(-50%, -75%);
      }
    100% {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
  }

  :global(div[role="menuitem"].clicked)::before {
    content: 'скопировано';
    animation: 1s ease-out both success;
    @apply absolute;
    @apply top-0;
    left: 50%;
    @apply bg-success;
    @apply text-success-content;
    @apply py-0.5;
    @apply px-1;
    @apply rounded-full;
  }

  .floating-menu {
    right: calc(100% - 100vw);
  }
</style>
