#!/usr/bin/env bash
export NVM_DIR=$HOME/.nvm
source $NVM_DIR/nvm.sh
current=$(nvm current | sed -e "s/^v//")
if [[ $1 == "--lts" ]]; then
  nvm install --lts
else
  nvm install node
fi
nvm uninstall $current
installed=$(nvm current | sed -e "s/^v//")
while IFS= read -r line; do
  cd $(dirname $line)
  if [[ $(pnpm pkg get engines) != "{}" ]]; then
    pnpm pkg set engines.node=$installed
  fi
  cd - > /dev/null
done <<< $(find . -mindepth 1 -maxdepth 2 -type f -name "package.json")
