<!-- Svelte компонент -- дашборд здоровья сервиса -->
<script>
  import * as Card from '$lib/components/ui/card';
  import { healthData } from '$lib/store/health-data.js';

  /**
   * Подписи к повторяющимся метрикам здоровья сервисов
   * @constant {string}
   */
  const SYSTEMD_SERVICE_LABEL = 'Systemd сервис';
  const HTTP_SERVER_LABEL = 'HTTP сервер';
  const REVERSE_PROXY_LABEL = 'HTTPS reverse proxy';
  const DB_CONNECION_LABEL = 'Подключение к БД';
  const HUB_CONNECTION_LABEL = 'Подключение к хабу';

  /**
   * Ключ сервиса в объекте с данными о проверке здороья сервисов
   * @type {'bot' | 'portal' | 'hub'}
   */
  export let service;

  /**
   * Подписи к метрикам здороья сервисов
   * @type {Map<'bot' | 'portal' | 'hub', Record<string, string>>}
   */
  const expectedProperties = new Map([[
    'bot',
    {
      service: SYSTEMD_SERVICE_LABEL,
      localhost: HTTP_SERVER_LABEL,
      https: REVERSE_PROXY_LABEL,
      dbConnection: DB_CONNECION_LABEL,
      localDBConnection: 'Подключение к LevelDB',
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
      socket: 'Подключение к сокету',
    },
  ]]);
</script>

{#if service}
  <Card.Root class="mb-6">
    <Card.Content class="pt-3 md:pt-6 flex flex-wrap items-center gap-6">
      {new Date($healthData.date).toLocaleString()}
      {#each Object.entries(expectedProperties.get(service)) as [ key, label ] (key)}
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded-full"
            class:success-bg={$healthData[service]?.[key]}
            class:error-bg={$healthData[service] && !$healthData[service][key]}
            class:undefined-bg={!$healthData[service]}
          />
          {label}
        </div>
      {/each}
    </Card.Content>
  </Card.Root>
{/if}
