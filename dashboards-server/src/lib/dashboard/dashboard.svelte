<!-- Svelte компонент -- дашборд -->
<script>
  import { deprive, inject } from '@tmible/wishlist-common/dependency-injector';
  import { Select } from 'bits-ui';
  import { Chart } from 'chart.js/auto';
  import Check from 'lucide-svelte/icons/check';
  import { onMount } from 'svelte';
  import { PERIOD } from '$lib/constants/period.const.js';
  import { skipFirstCall } from '$lib/skip-first-call.js';
  import { ThemeService } from '$lib/theme-service-injection-token.js';
  import { ChartBuilders } from './chart-builders.js';
  import { ChartUpdateAnimation } from './chart-update-animation.js';
  import { createDashboard } from './use-cases/create-dashboard.js';

  /** @typedef {import('./domain.js').DashboardConfig} DashboardConfig */
  /**
   * @typedef {import('./chart-update-animation.js').ShouldAnimateCriteria} ShouldAnimateCriteria
   */

  /**
   * Период, длиной в месяц, заканчивающийся текущим моментом
   * @constant {number}
   */
  const MONTH_PERIOD = Date.now() - new Date().setMonth(new Date().getMonth() - 1);

  /**
   * Опции периодов графиков на дашборде
   * @constant {{ label: string; value: PERIOD | number }[]}
   */
  const periodOptions = [{
    label: 'час',
    value: PERIOD.HOUR,
  }, {
    label: '6 часов',
    value: PERIOD.SIX_HOURS,
  }, {
    label: 'день',
    value: PERIOD.DAY,
  }, {
    label: 'неделя',
    value: PERIOD.WEEK,
  }, {
    label: '2 недели',
    value: PERIOD.TWO_WEEKS,
  }, {
    label: 'месяц',
    value: MONTH_PERIOD,
  }];

  /**
   * @typedef {object} Props
   * @property {'bot' | 'portal'} service Сервис, данные которого отображаются в дашборде
   * @property {DashboardConfig} config Конфиг для постройки дашборда
   */

  /** @type {Props} */
  const { service, config } = $props();

  /**
   * Хранилище данных дашборда
   * @type {import('./store.js').Store}
   */
  let store = $state();

  /**
   * Дашборд
   * @type {Chart}
   */
  let dashboard;

  /**
   * Выбранный период отображения для дашборда
   * @type {PERIOD | number}
   */
  let periodSelected = $state();

  /**
   * Выбранный период отображения для дашборда
   * @type {string}
   */
  const periodSelectedLabel = $derived(
    periodOptions.find(({ value }) => value === periodSelected)?.label,
  );

  /**
   * Выбранные для отображения графики
   * @type {{ value: string, label: string }[]}
   */
  let selectedCharts = $derived(
    Array.from($store?.charts.entries() ?? [])
      .filter(([, { isDisplayed } ]) => isDisplayed)
      .map(([ key ]) => key),
  );

  /**
   * Ширина кнопки, открывающей выпадающее меню для выбора отображаемых графиков
   * @type {number}
   */
  let chartsSelectWidth = $state();

  /**
   * HTML-элемент для отображения графиков
   * @type {HTMLCanvasElement}
   */
  let dashboardCanvas = $state();

  /**
   * Критерий необходимости применения анимации при обновлении графиков дашборда
   * @type {ShouldAnimateCriteria}
   */
  let shouldAnimateUpdate;

  /**
   * [Построение нового конфига]{@link ChartBuilders} и обновление дашборда
   * @function buildChart
   * @param {boolean} withData Признак необходимости обновления данных
   * @returns {void}
   */
  const buildChart = (withData = false) => {
    const previousState = { data: dashboard.data, options: dashboard.options };

    const chartConfig = ChartBuilders[config.key](
      Array.from($store.charts.values()).filter(({ isDisplayed }) => isDisplayed),
      Date.now() - $store.period,
      periodSelected,
    );

    if (withData) {
      dashboard.data = chartConfig.data;
    }
    dashboard.options = chartConfig.options;

    dashboard.update(...(shouldAnimateUpdate(previousState, chartConfig) ? [] : [ 'none' ]));
  };

  /**
   * Инициализация компонента, создание chart.js графика дашборда,
   * подписка на обновление данных в хранилище и темы
   */
  onMount(() => {
    store = inject(`${service} ${config.key} store`);
    periodSelected = $store.period;
    chartsSelectWidth = (
      Array.from($store.charts.values()).reduce(
        (longestLabelLength, { label }) => Math.max(label.length, longestLabelLength),
        0,
      ) ??
      10
    ) * 10;
    shouldAnimateUpdate = ChartUpdateAnimation[config.key];
    const chartConfig = ChartBuilders[config.key](
      Array.from($store.charts.values()).filter(({ isDisplayed }) => isDisplayed),
      Date.now() - $store.period,
      periodSelected,
    );

    dashboard = new Chart(dashboardCanvas, chartConfig);
    const storeUnsubscriber = store.subscribe(skipFirstCall(() => buildChart(true)));
    const themeUnsubscriber = inject(
      ThemeService,
    ).subscribeToTheme(
      skipFirstCall(() => buildChart()),
    );
    return () => {
      storeUnsubscriber();
      deprive(`${service} ${config.key} store`);
      themeUnsubscriber();
    };
  });

  // Создание дашборда
  createDashboard(service, config);
</script>

<div class={config.type === 'doughnut' ? 'md:flex md:justify-center' : ''}>
  <div
    class="flex flex-wrap items-center justify-center mb-6 gap-y-2"
    class:md:mb-0={config.type === 'doughnut'}
  >

    <label class="flex items-center mr-4">
      <span class="mr-2">период:</span>
      <Select.Root
        type="single"
        items={periodOptions}
        onValueChange={store?.updatePeriod}
        bind:value={periodSelected}
      >

        <Select.Trigger class="select select-sm select-bordered cursor-pointer min-w-[112px]">
          {periodSelectedLabel}
        </Select.Trigger>

        <Select.Portal>
          <Select.Content side="bottom" align="center" sideOffset={8} strategy="fixed">
            {#snippet child({ wrapperProps, props })}
              <div {...wrapperProps}>
                <ul class="select-options-list" {...props}>
                  {#each periodOptions as { value, label } (value)}
                    <Select.Item {value} {label}>
                      {#snippet child({ props, selected })}
                        <li {...props}>
                          <div class="flex justify-between cursor-pointer">
                            {label}
                            {#if selected}
                              <Check class="w-4 h-4" />
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
    </label>

    {#if $store?.charts.size > 1}
      <Select.Root
        type="multiple"
        items={(
          Array.from(
            $store?.charts.entries() ?? [],
            ([ key, { label } ]) => ({ value: key, label }),
          )
        )}
        onValueChange={store?.updateChartsSelection}
        bind:value={selectedCharts}
      >

        <Select.Trigger
          style={`width: ${chartsSelectWidth}px;`}
          class="select select-sm select-bordered cursor-pointer"
        >
          Графики
        </Select.Trigger>

        <Select.Portal>
          <Select.Content side="bottom" align="center" sideOffset={8} strategy="fixed">
            {#snippet child({ wrapperProps, props })}
              <div {...wrapperProps}>
                <ul class="select-options-list" {...props}>
                  {#each $store.charts.entries() as [ key, { label } ] (key)}
                    <Select.Item value={key} {label}>
                      {#snippet child({ props, selected })}
                        <li {...props}>
                          <div class="flex justify-between cursor-pointer">
                            {label}
                            {#if selected}
                              <Check class="w-4 h-4" />
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
    {/if}

  </div>

  <div class="relative">
    <canvas bind:this={dashboardCanvas}></canvas>
    {#if config.type === 'doughnut'}
      <svg
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        viewBox={`0 0 ${
          25 * (Math.max(...config.label.map((line) => line.length)) - 6.8)
        } ${
          30 + (21 * (config.label.length - 1))
        }`}
      >
        {#each config.label as line, i (line)}
          <text
            class="text-xl fill-(--color-base-content)"
            x="50%"
            y={21 + (21 * i)}
            text-anchor="middle"
          >
            {line}
          </text>
        {/each}
      </svg>
    {/if}
  </div>
</div>
