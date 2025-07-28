#!/usr/bin/env bash
directory=$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)
user=$(whoami)

echo "[Unit]
Description=Wishni health checker

[Service]
ExecStart=$directory/health-check.sh
User=$user
Group=$user
$(
  cat $directory/.env |
  sed -e "s/^/Environment=/"
)
WorkingDirectory=$directory
" > $directory/wishni-health-checker.service

echo "[Unit]
Description=Wishni health checker timer

[Timer]
OnBootSec=1min
OnUnitActiveSec=1min

[Install]
WantedBy=multi-user.target
" > $directory/wishni-health-checker.timer

mv $directory/wishni-health-checker.service /etc/systemd/system
mv $directory/wishni-health-checker.timer /etc/systemd/system
systemctl daemon-reload
systemctl start wishni-health-checker.timer
systemctl enable wishni-health-checker.timer
systemctl restart wishni-health-checker.timer
