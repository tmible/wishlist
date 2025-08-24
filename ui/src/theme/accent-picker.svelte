<!-- @component Компонент для выбора цветового акцента темы -->
<script>
  import { Select } from 'bits-ui';
  import Check from 'lucide-svelte/icons/check';
  import CircleAlert from 'lucide-svelte/icons/circle-alert';
  import { onMount } from 'svelte';
  import { subscribeToTheme, updateTheme } from './service.js';

  /**
   * @typedef {object} Props
   * @property {{ id: string; name: string; color: string }} accents Варианты акцентов для выбора
   */

  /** @type {Props} */
  const { accents } = $props();

  /**
   * Идентификатор выбранного акцента
   * @type {string | undefined}
   */
  let selectedAccentId = $state();

  /**
   * Выбранный акцент
   * @type {string | undefined}
   */
  const selectedAccent = $derived(accents.find(({ id }) => id === selectedAccentId));

  /**
   * Интерактивный элемент
   * @type {HTMLButtonElement | null}
   */
  let trigger = $state(null);

  // Обновление состояния при изменении темы в сервисе
  onMount(() => subscribeToTheme(({ accent }) => selectedAccentId = accent));

  // Обновление темы
  $effect(
    () => {
      if (!selectedAccentId) {
        return;
      }
      updateTheme({ accent: selectedAccentId });
    },
  );

  // Обновление цвета компонента в соответствии с выбранным акцентом
  $effect(
    () => {
      if (!selectedAccent) {
        return;
      }
      trigger.style.setProperty('--selected-accent-color', `var(--oc-${selectedAccent.color})`);
    },
  );
</script>

<Select.Root
  type="single"
  items={accents}
  bind:value={selectedAccentId}
>
  <Select.Trigger
    class="
      bg-base-100
      w-6
      h-6
      rounded-full
      border-base-content
      border
      p-1
      align-middle
      cursor-pointer
    "
    bind:ref={trigger}
  >
    {#if selectedAccent}
      <div class="bg-(--selected-accent-color) rounded-full w-full h-full"></div>
    {:else}
      <CircleAlert class="w-full h-full" />
    {/if}
  </Select.Trigger>

  <Select.Portal>
    <Select.Content side="bottom" align="center" sideOffset={8} strategy="fixed">
      {#snippet child({ wrapperProps, props })}
        <!-- eslint-disable svelte/no-inline-styles --
          Floating UI пишет z-index: auto прямо в стили элемента -->
        <div style:z-index="1000" {...wrapperProps}>
          <!-- eslint-enable svelte/no-inline-styles -->
          <ul class="shadow-xl menu bg-base-200 rounded-lg not-prose" {...props}>
            {#each accents as { id, label } (id)}
              <Select.Item value={id} {label}>
                {#snippet child({ props, selected })}
                  <li {...props}>
                    <div class="flex justify-between">
                      {label}
                      {#if selected}
                        <Check />
                      {/if}
                    </div>
                  </li>
                {/snippet}
              </Select.Item>
            {/each}
          </ul>
        </div>
      {/snippet}
    </Select.Content>
  </Select.Portal>
</Select.Root>
