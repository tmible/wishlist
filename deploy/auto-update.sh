#!/usr/bin/env bash
apt-get update -y
apt-get dist-upgrade -y
apt-get upgrade -y
apt-get autoremove -y
if [ -f /var/run/reboot-required.pkgs ]; then
  reboot
fi
do-release-upgrade -f DistUpgradeViewNonInteractive
if [ -f /var/run/reboot-required ]; then
  reboot
fi
