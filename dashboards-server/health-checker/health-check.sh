#!/usr/bin/env bash
file=$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)/current-status.json

check_systemd_service_status() {
  if [[ $(systemctl is-active $1) == "active" && $(systemctl is-enabled $1) == "enabled" ]]; then
    echo -n "true" >> $file
  else
    echo -n "false" >> $file
  fi
}

check_periodic_systemd_service_status() {
  is_active=$(systemctl is-active $1)
  if [[ $is_active == "active" || $is_active == "inactive" ]]; then
    echo -n "true" >> $file
  else
    echo -n "false" >> $file
  fi
}

check_localhost_status() {
  (echo $'\x1d'; echo "quit") | telnet localhost $1 > /dev/null 2>&1
  if [[ $? == 0 ]]; then
    echo -n "true" >> $file
  else
    echo -n "false" >> $file
  fi
}

check_https_status() {
  ping -c 1 -q $1 > /dev/null 2>&1
  if [[ $? == 0 ]]; then
    echo -n "true" >> $file
  else
    echo -n "false" >> $file
  fi
}

check_unix_socket_status() {
  echo -n | socat UNIX-CONNECT:$1 - > /dev/null 2>&1
  if [[ $? == 0 ]]; then
    echo -n "true" >> $file
  else
    echo -n "false" >> $file
  fi
}

request_health_data() {
  health_data=$(curl localhost:$1/$2 2>/dev/null)
  if [[ $? == 0 ]]; then
    echo -n $health_data | sed -e "s/^{//" | sed -e "s/}$//" | sed -e "/^$/! s/^/,/" >> $file
  fi
}

echo -n "{\"date\":$(date +%s000)," > $file

echo -n "\"bot\":{" >> $file
echo -n "\"service\":" >> $file
check_systemd_service_status wishni-bot
echo -n ",\"localhost\":" >> $file
check_localhost_status $(cat ../../bot/.env | grep ^PORT | cut -d "=" -f 2)
echo -n ",\"https\":" >> $file
check_https_status $(cat ../../bot/.env | grep ^HOST | cut -d "=" -f 2 | sed -e "s/^https:\/\///")
request_health_data $(cat ../../bot/.env | grep ^PORT | cut -d "=" -f 2) health
echo -n "}," >> $file

echo -n "\"portal\":{" >> $file
echo -n "\"service\":" >> $file
check_systemd_service_status wishni-portal
echo -n ",\"localhost\":" >> $file
check_localhost_status $(cat ../../portal/.env | grep ^PORT | cut -d "=" -f 2)
echo -n ",\"https\":" >> $file
check_https_status $(cat ../../portal/.env | grep ^ORIGIN | cut -d "=" -f 2 | sed -e "s/^https:\/\///")
request_health_data $(cat ../../portal/.env | grep ^PORT | cut -d "=" -f 2) api/health
echo -n "}," >> $file

echo -n "\"hub\":{" >> $file
echo -n "\"service\":" >> $file
check_systemd_service_status wishni-hub
echo -n ",\"socket\":" >> $file
socket_path=$(cat ../../hub/.env | grep ^SOCKET_PATH | cut -d "=" -f 2)
check_unix_socket_status $(cd -- ../$(dirname $socket_path); pwd -P )/$(basename $socket_path)
echo -n "}," >> $file

echo -n "\"refreshTokensCleaner\":{" >> $file
echo -n "\"timer\":" >> $file
check_systemd_service_status wishni-refresh-tokens-cleaner.timer
echo -n ",\"service\":" >> $file
check_periodic_systemd_service_status wishni-refresh-tokens-cleaner
echo -n "}" >> $file

echo "}" >> $file

fails=$(jq -r --argjson dictionary "$(cat $(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)/dictionary.json)" '
  walk(
    if type == "object" then
      with_entries(select(
        ((.value | type) == "object" and (.value | length) > 0) or
        .value == false
      ))
    else
      .
    end
  ) |
  paths |
  join(".") as $paths |
  $dictionary |
  getpath([$paths])
' $file)

# WireGuard is configured to route traffic for IP addresses of hc-ping.com through another node
# IPv4 of which is geolocated (by hc-ping.com / healthchecks.io) as russian, but IPv6 is not,
# therefore -6 option is present
if [[ $fails == "" ]]; then
  curl -6 "https://hc-ping.com/$HEALTHCHECKS_IO_UUID" 2>/dev/null
else
  curl -6 -X POST "https://hc-ping.com/$HEALTHCHECKS_IO_UUID/fail" --data-raw "$fails" 2>/dev/null
fi
