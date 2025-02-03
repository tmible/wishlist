#!/usr/bin/env bash
pnpm self-update
pnpm_version=$(pnpm -v)
while IFS= read -r line; do
  cd $(dirname $line)
  pnpm pkg set packageManager="pnpm@$pnpm_version"
  if [[ $(pnpm pkg get engines) != "{}" ]]; then
    pnpm pkg set engines.pnpm=$pnpm_version
  fi
  cd - > /dev/null
done <<< $(find . -mindepth 1 -maxdepth 2 -type f -name "package.json")
