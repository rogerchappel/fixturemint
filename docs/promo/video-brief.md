# Video brief: deterministic fixture packs from JSON Schema

## Angle

Show fixturemint as a small, local-first tool for generating reviewable test
fixtures from a schema plus a local recipe.

## Demo beats

1. Open `examples/user.schema.json` and point to required fields, enum values,
   and nested profile fields.
2. Open `examples/user.recipe.yaml` and show shared overrides plus named files
   with per-file seeds.
3. Run `bash examples/demo-fixture-pack.sh`.
4. Open `tmp/demo-fixtures/admin-user.json` and
   `tmp/demo-fixtures/viewer-user.json`.
5. Open `tmp/demo-fixtures/manifest.json` and point out file sizes and SHA-256
   checksums.

## Grounded talking points

- The CLI has `generate` and `manifest` commands.
- The fixture pack is deterministic for the same schema, recipe, and seed.
- The manifest is a compact review artifact for generated fixtures.

## Claims to avoid

- Do not claim complete JSON Schema support.
- Do not claim generated data is production-like.
- Do not imply the manifest replaces tests or schema validation.
