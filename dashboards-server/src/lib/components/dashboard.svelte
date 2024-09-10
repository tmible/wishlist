<!-- Svelte компонент -- шаблонный дашборд с любым типом графика -->
<script>
  import { subscribeToTheme } from '@tmible/wishlist-common/theme-service';
  import { Chart } from 'chart.js/auto';
  import { onMount, tick } from 'svelte';
  import { Label } from '$lib/components/ui/label';
  import * as Select from '$lib/components/ui/select';
  import { PERIOD } from '$lib/constants/period.const.js';

  /** @typedef {import('chart.js').ChartConfiguration} ChartConfiguration */
  /** @typedef {import('svelte/store').Writable} Writable */
  /**
   * Информация для графика дашборда
   * @typedef {object} DashboardChart
   * @property {string} key Уникальный ключ графика
   * @property {string} label Подпись к графику
   * @property {boolean} isDisplayed Признак отображения графика
   * @property {number?} period Период, данные за который хранятся
   * @property {(
   *   {
   *     [key: DashboardChart['key']]: number;
   *   } & {
   *     [key: string]: unknown;
   * })[]} data Данные для постоения графика
   */

  /**
   * Период автоматического обновления графиков
   * @constant {number}
   */
  const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000;

  /**
   * Период, длиной в месяц, заканчивающийся текущим моментом
   * @constant {number}
   */
  const MONTH_PERIOD = Date.now() - new Date().setMonth(new Date().getMonth() - 1);

  /**
   * Данные для постороения графиков
   * @type {DashboardChart['data']}
   */
  export let data;

  /**
   * Svelte хранилище с информацией для построения графиков
   * @type {Writable<DashboardChart[]> | null}
   */
  export let chartsStore = null;

  /**
   * Признак автоматического обновления дашборда
   * @type {boolean}
   */
  export let isAutoUpdating = true;

  /**
   * Период отображения для дашборда по умолчанию
   * @type {PERIOD | number}
   */
  export let defaultPeriodSelected = PERIOD.DAY;

  /**
   * Получение данных для графиков и обновление графиков в дашборде
   * @type {(
   *   dashboard: Chart,
   *   periodStart: number,
   *   shouldRequestAll: boolean,
   * ) => Promise<void>}
   */
  export let getDataAndUpdateChartProps;

  /**
   * Формирование параметров дашборда для его создания
   * @type {(
   *   data: DashboardChart['data'],
   *   periodStart: number,
   * ) => ChartConfiguration}
   */
  export let formChartOptions;

  /**
   * Признак отображения графика с шириной в половину контейнера
   * @type {boolean}
   */
  export let isHalfWidth = false;

  /**
   * Обновление цветов графиков при смене темы
   * @type {(isDark: boolean, dashboard: Chart) => void}
   */
  /* eslint-disable-next-line unicorn/no-useless-undefined, no-undef-init --
    Опциональное свойство Svelte компонента */
  export let themeSubscriber = undefined;

  /**
   * HTML-элемент для отображения графиков
   * @type {HTMLCanvasElement}
   */
  let dashboardCanvas;

  /**
   * Дашборд
   * @type {Chart}
   */
  let dashboard;

  /**
   * Идентификатор таймера автоматического обновления дашборда
   * @type {number}
   */
  let autoUpdateInterval;

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
   * Выбранный период отображения для дашборда
   * @type {{ value: PERIOD | number, label: string }}
   */
  let periodSelected = periodOptions.find(({ value }) => value === defaultPeriodSelected);

  /**
   * Ширина кнопки, открывающей выпадающее меню для выбора отображаемых графиков
   * @constant {number}
   */
  const chartsSelectWidth = (($chartsStore ?? [])
    .reduce(
      (longestLabelLength, { label }) => (
        label.length > longestLabelLength ? label.length : longestLabelLength
      ),
      0,
    ) ?? 10) * 10;

  /**
   * Обновление дашборда
   * @function updateDashboard
   * @param {boolean} shouldRequestAll Признак необходимости запроса данных для всех графиков
   * @returns {Promise<void>}
   * @async
   */
  const updateDashboard = async (shouldRequestAll = true) => {
    if (!dashboard) {
      return;
    }

    await getDataAndUpdateChartProps(
      dashboard,
      Date.now() - periodSelected.value,
      periodSelected.value,
      shouldRequestAll,
    );
  };

  /**
   * Создание графиков дашборда
   * @function createDashboard
   * @returns {void}
   */
  const createDashboard = () => {
    if (isAutoUpdating) {
      autoUpdateInterval = setInterval(updateDashboard, AUTO_UPDATE_INTERVAL);
    }

    const periodStart = Date.now() - periodSelected.value;

    if (chartsStore) {
      $chartsStore.filter(({ isDisplayed }) => isDisplayed).forEach((chart, i) => {
        chart.data = data[i];
        chart.period = periodSelected.value;
      });
    }

    dashboard = new Chart(dashboardCanvas, formChartOptions(data, periodStart));
  };

  /**
   * Создание дашборда и, если необходимо, очистка интервала автоматического
   * обновления и отписка от измененя темы при уничтожении компонента
   */
  onMount(() => {
    (async () => {
      await tick();
      await createDashboard();
    })();

    let themeUnsubscriber;
    if (themeSubscriber) {
      themeUnsubscriber = subscribeToTheme((isDark) => {
        if (!dashboard) {
          return;
        }
        themeSubscriber(isDark, dashboard);
      });
    }

    return () => {
      if (isAutoUpdating) {
        clearInterval(autoUpdateInterval);
      }
      if (themeUnsubscriber) {
        themeUnsubscriber();
      }
    };
  });

  /**
   * Выбранные для отображения графики
   */
  $: selectedCharts = ($chartsStore ?? [])
    .filter(({ isDisplayed }) => isDisplayed)
    .map(({ key, label }) => ({ value: key, label }));
</script>

<div class={isHalfWidth ? 'md:flex md:justify-center' : ''}>
  <div class="flex flex-wrap items-center justify-center mb-6 gap-y-2" class:md:mb-0={isHalfWidth}>

    <Label class="flex items-center mr-4">
      <span class="mr-2">период:</span>
      <Select.Root
        selected={periodSelected}
        onSelectedChange={async (selected) => {
          periodSelected = selected;
          await updateDashboard();
        }}
        preventScroll={false}
      >

        <Select.Trigger class="min-w-[112px]">
          <Select.Value />
        </Select.Trigger>

        <Select.Content>
          {#each periodOptions as { value, label } (value)}
            <Select.Item {value} {label} />
          {/each}
        </Select.Content>

      </Select.Root>
    </Label>

    {#if $chartsStore}
      <Select.Root
        multiple
        selected={selectedCharts}
        onSelectedChange={async (selected) => {
          $chartsStore.forEach((chart) => {
            chart.isDisplayed = !!selected.some(({ value }) => value === chart.key);
          });
          await updateDashboard(false);
        }}
        preventScroll={false}
      >

        <Select.Trigger style={`width: ${chartsSelectWidth}px;`}>
          Графики
        </Select.Trigger>

        <Select.Content>
          {#each $chartsStore as { key, label } (key)}
            <Select.Item value={key} {label} />
          {/each}
        </Select.Content>

      </Select.Root>
    {/if}

  </div>

  <div class="relative">
    <canvas bind:this={dashboardCanvas} />
    <slot {dashboard} />
  </div>
</div>
