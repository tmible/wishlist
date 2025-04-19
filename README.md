# wishlist
Инструмент для работы со списками желаний  

# Состав
- [телеграм бот](bot/README.md)
- [портал](portal/README.md)
- [сервер с дашбордами](dashboards-server/README.md)
- [IPC хаб](hub/README.md)

# Общие файлы
- `assets` сопутствующие проекту статические файлы
- `deploy` скрипты для генерации файлов с описанием сервисов для systemd
- `scripts` скрипты для разработки
- `local.db` LevelDB БД для горячих данных
- `logs-db-migrations` SQL скрипты миграций БД для хранения логов
- `wishlist-db-migrations` SQL скрипты миграций БД со списками желаний
- `logs.db` SQLite БД для хранения логов
- `wishlist.db` SQLite БД со списками желаний
- `eslint-config` пакет с общей конфигурацией ESLint

# Что нужно для начала работы
## Внешние зависимости
- node
- pnpm
- curl
- uuidgen
- jq

## Переменные окружения
### ./scripts
- `GIGA_CHAT_AUTH_TOKEN` [ключ авторизации в проекте GigaChat API](https://developers.sber.ru/docs/ru/gigachat/quickstart/ind-using-api)
- `KANDINSKY_API_KEY` [API ключ Fusion Brain](https://fusionbrain.ai/docs/doc/api-dokumentaciya/)
- `KANDINSKY_API_SECRET` [секретный ключ Fusion Brain](https://fusionbrain.ai/docs/doc/api-dokumentaciya/)

## Сетевые требования
- установленные сертификаты Минцифры России для работы с REST API Сбера
