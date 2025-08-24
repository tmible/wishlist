# Wishni dashboards server
Сервер с дашбордами для [телеграм бота](bot/README.md) и [портала](portal/README.md) со списками желаний и их [IPC хаба](hub/README.md)

# Требования к удалённой машине
## Внешние зависимости
- node
- pnpm
- rsync (для деплоя)
- certbot
- nginx
- socat (для [health-checker](health-checker))

## Переменные окружения
- `ADMIN_PASSWORD` SHA-256 хэш пароля админа
- `HMAC_SECRET` случайный SHA-256 хэш для генерации jwt-токенов аутентификации
- `LOGS_DB_FILE_PATH` путь к SQLite БД с логами
- `LOGS_DB_MIGRATIONS_PATH` путь к папке с SQL скриптами миграций БД для хранения логов
- `ORIGIN` https://используемый_домен
- `PORT` порт для Node.js сервера

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

# [health-checker](health-checker)
Вспомогательный systemd сервис, раз в минуту проверяющий здоровье сервисов
