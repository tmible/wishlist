#!/usr/bin/env bash
directory=$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)
user=$(whoami)

echo "[Unit]
Description=Tmible's auto updater for packages and OS

[Service]
ExecStart=$directory/auto-update.sh
User=$user
Group=$user
WorkingDirectory=$directory
" > $directory/auto-update.service

echo "[Unit]
Description=Tmible's auto updater for packages and OS timer

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=multi-user.target
" > $directory/auto-update.timer

sudo mv $directory/auto-update.service /etc/systemd/system
sudo mv $directory/auto-update.timer /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl start auto-update.timer
sudo systemctl enable auto-update.timer
sudo systemctl restart auto-update.timer
