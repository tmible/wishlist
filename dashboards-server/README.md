# wishlist-bot-dashboards-server
Сервер с дашбордами для [телеграм-бота со списками желаний](https://github.com/tmible/wishlist-bot)

# Требования к удалённой машине
## Внешние зависимости
- node
- pnpm
- forever
- dotenvx
- rsync (ддя деплоя)

## Переменные окружения
- `ADMIN_PASSWORD` SHA-256 хэш пароля админа
- `HMAC_SECRET` случайный SHA-256 хэш для генерации jwt-токенов аутентификации
- `LOGS_DB_FILE_PATH` путь к SQLite БД с логами

## Сетевые требования
- ssl сертификат
- (и следовательно) домен
