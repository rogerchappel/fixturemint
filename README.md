# fixturemint

Deterministic fixture pack generation for JSON Schema and local YAML/JSON
recipes.

## Status

This repository is early-stage. The CLI can generate JSON fixtures and checksum
manifests, but schema support is intentionally focused on common fixture shapes.

## Install

Install dependencies and build locally:

```sh
npm install
npm run build
```

## Use

Generate fixtures from a JSON Schema:

```sh
npx fixturemint generate examples/user.schema.json \
  --recipe examples/user.recipe.yaml \
  --seed 42 \
  --out fixtures/smoke
```

Write a manifest with sizes and SHA-256 checksums:

```sh
npx fixturemint manifest fixtures/smoke --out fixtures/smoke-manifest.json
```

From source, use the built CLI directly:

```sh
node dist/src/cli.js generate examples/user.schema.json --recipe examples/user.recipe.yaml --seed 42 --out fixtures/smoke
```

## Demo Recipe

Run the fixture-backed demo:

```sh
bash examples/demo-fixture-pack.sh
```

The demo builds the CLI, generates the two example user fixtures into
`tmp/demo-fixtures`, writes a manifest, and prints a compact checksum summary.
See [Generate deterministic API fixtures](docs/tutorials/deterministic-api-fixtures.md)
for the full recipe.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

For a smaller loop:

```sh
npm run check
npm test
npm run smoke
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Replace
the default security policy before publishing the generated repository.

These links assume this README has been copied to the generated repository root.

## License

MIT
