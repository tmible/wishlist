has_changes() {
  if ! git diff-index --quiet --cached HEAD $1; then
    return 0;
  else
    return 1;
  fi
}

IFS="|" read -r -a packages <<< $(
  cat pnpm-workspace.yaml |
    tr -d "\n" |
    sed "s/.*packages:\(\(\s*- \"\([a-z-]\+\)\"\)*\).*/\1/" |
    sed "s/^[^\"]*\(\".*\)/\1/" |
    sed "s/\(.*\"\)[^\"]*\$/\1/" |
    sed "s/\s*- /|/g" |
    tr -d "\""
)

changed_only=false
while getopts c flag; do
  case "${flag}" in
    c) changed_only=true;;
  esac
done
shift $((OPTIND - 1))

if ! $changed_only; then
  IFS="|"
  echo -n "${packages[*]}"
  unset IFS
  exit 0
fi

has_changes=()
for package in "${packages[@]}"; do
  if $(has_changes "$package/$1"); then
    has_changes+=($package)
  fi
done

IFS="|"
echo -n "${has_changes[*]}"
unset IFS
