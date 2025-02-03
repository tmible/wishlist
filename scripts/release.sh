#!/usr/bin/env bash

release_types=(major minor patch)

export $(cat "$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)/.env" | xargs)

package=$(pnpm pkg get name | tr -d "\"")

release_type=""
IFS="|"
while ! echo "${IFS}${release_types[*]}${IFS}" | grep "${IFS}${release_type}${IFS}" > /dev/null; do
  read -p "Укажите тип релиза $package (${release_types[*]}): " release_type < /dev/tty
done
unset IFS
echo "Обновляю версию в $(pnpm prefix)/package.json"
index=$( echo ${release_types[*]/$release_type//} | cut -d/ -f1 | wc -w | tr -d " " )
IFS="." read -r -a version <<< $(pnpm pkg get version | tr -d "\"")
version[$index]=$(( version[$index] + 1 ))
for (( i = $index + 1; i < 3; i++ )); do
  version[$i]="0"
done
IFS="."
pnpm pkg set "version=${version[*]}"
echo "Версия обновлена до ${version[*]}"
unset IFS

echo "Запрашиваю у GigaChat название релиза"
access_token=$(
  curl -L -X POST "https://ngw.devices.sberbank.ru:9443/api/v2/oauth" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Accept: application/json" \
    -H "RqUID: $(uuidgen)" \
    -H "Authorization: Basic $GIGA_CHAT_AUTH_TOKEN" \
    --data-urlencode "scope=GIGACHAT_API_PERS" \
    2>/dev/null \
  | jq -r ".access_token"
)
prompt=$(
  cat "$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)/gigachat-prompt.json" |
  tr "\n" "\0" |
  sed "s|%current_timestamp%|$(date +%s)|" |
  tr "\0" "\n"
)
release_name=$(
  curl -L -X POST "https://gigachat.devices.sberbank.ru/api/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $access_token" \
    --data-raw "$prompt" \
    2>/dev/null |
  jq -r ".choices[0].message.content" |
  sed -e "s/^\"\|\"$//g"
)
echo "Название релиза от GigaChat — $release_name"

echo -n "Запрашиваю у Kandinsky изображение релиза"
model_id=$(
  curl "https://api-key.fusionbrain.ai/key/api/v1/models" \
    -H "X-Key: Key $KANDINSKY_API_KEY" \
    -H "X-Secret: Secret $KANDINSKY_API_SECRET" \
    2>/dev/null |
  jq -r ".[0].id"
)
prompt=$(
  cat "$(cd -- $(dirname "${BASH_SOURCE[0]}") ; pwd -P)/kandinsky-prompt.json" |
  tr "\n" "\0" |
  sed "s|\"%release_name%\\\\\"|\\\\\"$release_name\\\\\\\\\"|" |
  sed "s|\"|\\\\\\\"|g" |
  tr "\0" "\n"
)
task_uuid=$(
  curl -L -X POST "https://api-key.fusionbrain.ai/key/api/v1/text2image/run" \
    -H "X-Key: Key $KANDINSKY_API_KEY" \
    -H "X-Secret: Secret $KANDINSKY_API_SECRET" \
    -F "model_id=\"$model_id\"" \
    -F "params=\"$prompt\";type=application/json" \
    2>/dev/null |
  jq -r ".uuid"
)
if [[ $task_uuid == null ]]; then
  echo -e "\nИзображение релиза от Kandinsky не получено"
  exit 1
fi
for (( attempts = 20; attempts > 0; attempts-- )); do
  spinner[0]="—"
  spinner[1]="\\"
  spinner[2]="|"
  spinner[3]="/"
  for (( delay = 0; delay < 100; delay++ )); do
    echo -ne "\rЗапрашиваю у Kandinsky изображение релиза ${spinner[$(( $delay % 4 ))]} \r"
    sleep 0.1
  done
  echo -ne "\rЗапрашиваю у Kandinsky изображение релиза  "
  status=$(
    curl "https://api-key.fusionbrain.ai/key/api/v1/text2image/status/$task_uuid" \
      -H "X-Key: Key $KANDINSKY_API_KEY" \
      -H "X-Secret: Secret $KANDINSKY_API_SECRET" \
      2>/dev/null
  )
  if [[ $(echo $status | jq -r ".status") == "FAIL" ]]; then
    echo -e "\nИзображение релиза от Kandinsky не получено"
    exit 1
  fi
  if [[ $(echo $status | jq -r ".status") == "DONE" ]]; then
    release_image=$(echo $status | jq -r ".images[0]")
    echo -e "\nИзображение релиза от Kandinsky получено"
    break
  fi
  if (( $attempts == 1 )); then
    echo -e "\nВремя ожидания изображения релиза от Kandinsky истекло"
    exit 1
  fi
done

echo "Записываю релиз в changelog"
last_commit=$(git rev-parse --short HEAD)
origin=$(git remote get-url origin | tr ":" "/" | sed "s|^git@|https://|" | sed "s|.git$||")
IFS="."
touch "./release-images/${version[*]}.png"
base64 -d <<< $release_image > "./release-images/${version[*]}.png"
sed -i "s|^\($origin/compare/[a-z0-9]\+..\)master|\1$last_commit|1" $(pnpm prefix)/CHANGELOG.md
sed -i "1s|^# Changelog|# Changelog\n\n## ${version[*]} $release_name ($(date +%F))\n<img width=\"128\" height=\"128\" src=\"release-images/${version[*]}.png\"\/>\n\n$origin/compare/$last_commit..master\n|" $(pnpm prefix)/CHANGELOG.md
unset IFS
echo "Changelog обновлён"
