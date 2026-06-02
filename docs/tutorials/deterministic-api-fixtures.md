# Generate deterministic API fixtures

This recipe uses the included user schema and recipe to create a small fixture
pack that can be reviewed in git and verified by checksum.

## Run the demo

```sh
bash examples/demo-fixture-pack.sh
```

Expected output shape:

```text
fixturemint demo: generating deterministic user fixtures
tmp/demo-fixtures/admin-user.json
tmp/demo-fixtures/viewer-user.json

fixturemint demo: writing manifest
files: 2
- admin-user.json 182 bytes 9c43e052f10f...
- viewer-user.json 211 bytes 4d91cc10e7d9...
```

The exact manifest timestamp changes each run. The generated fixture checksums
remain stable for the same schema, recipe, and seed.

## What the files prove

- `examples/user.schema.json` defines the object shape, required fields, enum
  values, and simple length/range constraints.
- `examples/user.recipe.yaml` sets `count`, a shared `active: true` override,
  a display name example, and named output files with per-file seeds.
- `node dist/src/cli.js manifest` records fixture sizes and SHA-256 checksums.

## CI recipe

For a project that commits generated fixtures, run generation into a temporary
directory and compare it with the checked-in pack:

```sh
node dist/src/cli.js generate examples/user.schema.json \
  --recipe examples/user.recipe.yaml \
  --seed 42 \
  --out tmp/expected-fixtures
node dist/src/cli.js manifest tmp/expected-fixtures --out tmp/expected-fixtures/manifest.json
```

Reviewers can inspect the JSON files and use the manifest when they need a
compact proof that the pack did not drift.
