#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${1:-tmp/demo-fixtures}"
manifest_path="$out_dir/manifest.json"

npm run build >/dev/null
rm -rf "$out_dir"

echo "fixturemint demo: generating deterministic user fixtures"
node dist/src/cli.js generate examples/user.schema.json \
  --recipe examples/user.recipe.yaml \
  --seed 42 \
  --out "$out_dir"

echo ""
echo "fixturemint demo: writing manifest"
node dist/src/cli.js manifest "$out_dir" --out "$manifest_path"

node - "$manifest_path" <<'NODE'
const fs = require("node:fs");
const manifest = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

console.log(`files: ${manifest.files.length}`);
for (const file of manifest.files) {
  console.log(`- ${file.path} ${file.bytes} bytes ${file.sha256.slice(0, 12)}...`);
}
NODE
