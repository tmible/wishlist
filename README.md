# wishlist-bot
Телеграм-бот со списками желаний

# Требования к удалённой машине
## Внешние зависимости
- node
- pnpm
- rsync (ддя деплоя)

## Переменные окружения
- `BOT_TOKEN` токен бота
- `WISHLIST_DB_FILE_PATH` путь к SQLite БД со списками желаний
- `WISHLIST_DB_MIGRATIONS_PATH` путь к папке с SQL скриптами миграций БД со списками желаний
- `LOCAL_DB_PATH` путь к LevelDB БД для горячих данных
- `LOGS_DB_FILE_PATH` путь к SQLite БД для хранения логов
