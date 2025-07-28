#!/usr/bin/env bash
directory=$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)
user=$(whoami)

echo "[Unit]
Description=Wishni portal refresh tokens cleaner

[Service]
ExecStart=$directory/refresh-tokens-cleaner.sh
User=$user
Group=$user
$(
  cat $directory/../.env |
  grep ^WISHLIST_DB_FILE_PATH |
  sed -e "s|=|=$directory/../|" |
  sed -e "s/^/Environment=/"
)
WorkingDirectory=$directory
" > $directory/wishni-refresh-tokens-cleaner.service

echo "[Unit]
Description=Wishni portal refresh tokens cleaner timer

[Timer]
OnCalendar=*-*-* 02:50:00
Persistent=true

[Install]
WantedBy=multi-user.target
" > $directory/wishni-refresh-tokens-cleaner.timer

mv $directory/wishni-refresh-tokens-cleaner.service /etc/systemd/system
mv $directory/wishni-refresh-tokens-cleaner.timer /etc/systemd/system
systemctl daemon-reload
systemctl start wishni-refresh-tokens-cleaner.timer
systemctl enable wishni-refresh-tokens-cleaner.timer
systemctl restart wishni-refresh-tokens-cleaner.timer
