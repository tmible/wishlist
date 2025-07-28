#!/usr/bin/env bash
node "$(dirname "${BASH_SOURCE[0]}")/generate-systemd-service.mjs"
sudo mv "$SERVICE_NAME.service" /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl start $SERVICE_NAME
sudo systemctl enable $SERVICE_NAME
