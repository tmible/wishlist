<!-- Svelte компонент -- мобильное меню портала -->
<script>
  import { DropdownMenu } from 'bits-ui';
  import Ellipsis from 'lucide-svelte/icons/ellipsis';
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
  class="fixed bottom-0 right-6 transition-transform md:hidden"
  class:bottom-6={!isMenuHidden}
  class:translate-y-[100%]={isMenuHidden}
  class:invisible={isMenuHidden}
>
  <DropdownMenu.Root preventScroll={false}>
    <DropdownMenu.Trigger class="btn btn-primary btn-circle">
      <Ellipsis />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      class="shadow-xl menu bg-base-300 rounded-box"
      side="top"
      sideOffset={16}
      strategy="fixed"
      align="end"
      transition={flyAndScale}
    >
      {#each options as { icon, label, testId, children, onClick, condition = true } (label)}
        {#if condition}
          {#if children}
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger data-testid={testId}>
                {@const Icon = icon}
                <li>
                  <span>
                    <Icon class="w-5 h-5" />
                    {label}
                  </span>
                </li>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent
                class="shadow-xl menu bg-base-300 rounded-box"
                sideOffset={12}
                strategy="fixed"
                transition={flyAndScale}
                side="top"
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
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          {:else}
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
          {/if}
        {/if}
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
