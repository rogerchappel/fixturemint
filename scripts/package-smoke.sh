#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$repo_root"
npm run build >/dev/null
npm pack --dry-run >/dev/null
npm pack --pack-destination "$tmp" >/dev/null

package_tgz="$(find "$tmp" -maxdepth 1 -name 'fixturemint-*.tgz' -print -quit)"
test -n "$package_tgz"

mkdir -p "$tmp/app"
cd "$tmp/app"
npm init -y >/dev/null
npm install "$package_tgz" >/dev/null

installed_version="$(./node_modules/.bin/fixturemint --version)"
test "$installed_version" = "$(node -p "require('./node_modules/fixturemint/package.json').version")"

./node_modules/.bin/fixturemint generate \
  node_modules/fixturemint/examples/user.schema.json \
  --recipe node_modules/fixturemint/examples/user.recipe.yaml \
  --seed 42 \
  --out "$tmp/generated"
./node_modules/.bin/fixturemint manifest "$tmp/generated" --out "$tmp/manifest.json"
test -s "$tmp/manifest.json"

echo 'fixturemint package smoke passed'
