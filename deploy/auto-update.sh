#!/usr/bin/env bash
sudo apt update -y
sudo apt dist-upgrade -y
sudo apt upgrade -y
sudo apt autoremove -y
if [ -f /var/run/reboot-required.pkgs ]; then
  sudo reboot
fi
do-release-upgrade -f DistUpgradeViewNonInteractive
if [ -f /var/run/reboot-required ]; then
  sudo reboot
fi
