# wishlist
Инструмент для работы со списками желаний  

# Состав
- [телеграм бот](bot/README.md)
- [портал](portal/README.md)
- [сервер с дашбордами](dashboards-server/README.md)
- [IPC хаб](hub/RADME.md)

# Общие файлы
- `assets` сопутствующие проекту статические файлы
- `deploy` скрипт для генерации файла с описанием сервиса для systemd
- `local.db` LevelDB БД для горячих данных
- `logs-db-migrations` SQL скрипты миграций БД для хранения логов
- `wishlist-db-migrations` SQL скрипты миграций БД со списками желаний
- `logs.db` SQLite БД для хранения логов
- `wishlist.db` SQLite БД со списками желаний
