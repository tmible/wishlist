<!-- @component Дашборд здоровья сервиса -->
<script>
  import { health } from './store.js';

  /** @typedef {'bot' | 'portal' | 'hub' | 'refreshTokensCleaner'} Service */

  /**
   * @typedef {object} Props
   * @property {Service} service Ключ сервиса в объекте с данными о проверке здороья сервисов
   */

  /** @type {Props} */
  const { service } = $props();

  /**
   * Подписи к метрикам здоровья сервисов
   * @constant {string}
   */
  const SYSTEMD_SERVICE_LABEL = 'Systemd сервис';
  const HTTP_SERVER_LABEL = 'HTTP сервер';
  const REVERSE_PROXY_LABEL = 'HTTPS reverse proxy';
  const DB_CONNECION_LABEL = 'Подключение к БД';
  const HUB_CONNECTION_LABEL = 'Подключение к хабу';
  const LOCAL_DB_CONNECTION_LABEL = 'Подключение к LevelDB';
  const SOCKET_CONNECTION_LABEL = 'Подключение к сокету';
  const SYSTEMD_TIMER_LABEL = 'Systemd таймер';

  /**
   * Подписи к метрикам здороья сервисов
   * @type {Map<Service, Record<string, string>>}
   */
  const expectedProperties = new Map([[
    'bot',
    {
      service: SYSTEMD_SERVICE_LABEL,
      localhost: HTTP_SERVER_LABEL,
      https: REVERSE_PROXY_LABEL,
      dbConnection: DB_CONNECION_LABEL,
      localDBConnection: LOCAL_DB_CONNECTION_LABEL,
      hubConnection: HUB_CONNECTION_LABEL,
    },
  ], [
    'portal',
    {
      service: SYSTEMD_SERVICE_LABEL,
      localhost: HTTP_SERVER_LABEL,
      https: REVERSE_PROXY_LABEL,
      dbConnection: DB_CONNECION_LABEL,
      hubConnection: HUB_CONNECTION_LABEL,
    },
  ], [
    'hub',
    {
      service: SYSTEMD_SERVICE_LABEL,
      socket: SOCKET_CONNECTION_LABEL,
    },
  ], [
    'refreshTokensCleaner',
    {
      timer: SYSTEMD_TIMER_LABEL,
      service: SYSTEMD_SERVICE_LABEL,
    },
  ]]);
</script>

<div class="flex flex-wrap items-center gap-6">
  {new Date($health.date).toLocaleString()}
  {#each Object.entries(expectedProperties.get(service)) as [ key, label ] (key)}
    <div class="flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-full"
        class:bg-success={$health[service]?.[key]}
        class:bg-error={$health[service] && !$health[service][key]}
        class:bg-undefined={!$health[service]}
      ></div>
      {label}
    </div>
  {/each}
</div>
