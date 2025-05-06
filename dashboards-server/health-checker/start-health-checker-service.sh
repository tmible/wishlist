#!/usr/bin/env bash
directory=$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)
user=$(whoami)

echo "[Unit]
Description=Tmible's wishlist health checker

[Service]
ExecStart=$directory/health-check.sh
User=$user
Group=$user
$(
  cat $directory/.env |
  sed -e "s/^/Environment=/"
)
WorkingDirectory=$directory
" > $directory/wishlist-health-checker.service

echo "[Unit]
Description=Tmible's wishlist health checker timer

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min

[Install]
WantedBy=multi-user.target
" > $directory/wishlist-health-checker.timer

mv $directory/wishlist-health-checker.service /etc/systemd/system
mv $directory/wishlist-health-checker.timer /etc/systemd/system
systemctl daemon-reload
systemctl start wishlist-health-checker.timer
systemctl enable wishlist-health-checker.timer
systemctl restart wishlist-health-checker.timer
