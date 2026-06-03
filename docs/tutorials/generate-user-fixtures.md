# Generate User Fixtures

This tutorial uses the checked-in user schema and recipe to generate deterministic JSON fixtures and a checksum manifest.

## Build the CLI

```sh
npm run build
```

## Generate the fixtures

```sh
rm -rf /tmp/fixturemint-demo
node dist/src/cli.js generate examples/user.schema.json \
  --recipe examples/user.recipe.yaml \
  --seed 42 \
  --out /tmp/fixturemint-demo
```

The recipe creates two files:

- `admin-user.json` with `role` overridden to `admin`
- `viewer-user.json` with `role` overridden to `viewer`

The recipe also sets `active: true` and `profile.displayName: "Fixture User"`.

## Write a manifest

```sh
node dist/src/cli.js manifest /tmp/fixturemint-demo --out /tmp/fixturemint-demo-manifest.json
```

The manifest records each generated path, file size, and SHA-256 checksum. Use it when a test suite needs to prove fixture output did not drift.

## Inspect the result

```sh
find /tmp/fixturemint-demo -type f -maxdepth 2 -print
cat /tmp/fixturemint-demo-manifest.json
```

With the current example recipe, the generated pack contains `admin-user.json` and `viewer-user.json`.

## Smoke check

Run the repository smoke command before recording or sharing a demo:

```sh
npm run smoke
```
