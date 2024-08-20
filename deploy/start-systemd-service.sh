#!/usr/bin/env bash
node "$(dirname "${BASH_SOURCE[0]}")/generate-systemd-service.mjs"
mv "$SERVICE_NAME.service" /etc/systemd/system
systemctl daemon-reload
systemctl start $SERVICE_NAME
systemctl enable $SERVICE_NAME
