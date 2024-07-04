#!/usr/bin/env bash
node "$(dirname "${BASH_SOURCE[0]}")/generate-systemd-service.js"
mv "$SERVICE_NAME.service" /etc/systemd/system
systemctl start $SERVICE_NAME
systemctl daemon-reload
systemctl enable $SERVICE_NAME
