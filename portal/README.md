# Wishni portal
Портал со списками желаний

# Требования к удалённой машине
## Внешние зависимости
- node
- pnpm
- rsync (для деплоя)
- certbot
- nginx
- sqlite3 (для [refresh-tokens-cleaner](refresh-tokens-cleaner))

## Переменные окружения
- `HMAC_SECRET` случайный SHA-256 хэш для генерации jwt-токенов аутентификации
- `WISHLIST_DB_FILE_PATH` путь к SQLite БД со списками желаний
- `WISHLIST_DB_MIGRATIONS_PATH` путь к папке с SQL скриптами миграций БД со списками желаний
- `LOGS_DB_FILE_PATH` путь к SQLite БД с логами
- `LOGS_DB_MIGRATIONS_PATH` путь к папке с SQL скриптами миграций БД для хранения логов
- `ORIGIN` https://используемый_домен
- `PORT` порт для Node.js сервера
- `HUB_SOCKET_PATH` путь к UNIX сокету IPC хаба для синхронизации списков желаний
- `BOT_TOKEN` токен бота

## Сетевые требования
- nginx, конфигурация которого включает следующий фрагмент:
```nginx
http {
    server {
        server_name {{ используемый_домен }};
        location / {
            proxy_pass http://localhost:{{ порт для Node.js сервера }};
        }
    }
}
```
- домен. Указывается в переменной окружения и в конфигурации nginx
- TLS сертификат. Устанавливается автоматически с помощью certbot

# [refresh-tokens-cleaner](refresh-tokens-cleaner)
Вспомогательный systemd сервис, запускающийся раз в сутки по таймеру. Удаляет из БД протухшие refresh токены
