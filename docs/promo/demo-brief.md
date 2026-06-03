# Demo Brief: Deterministic JSON Fixtures From Schema and Recipe

## Audience

Developers who need repeatable fixture packs for tests, examples, or docs without hand-writing every JSON object.

## Core claim

fixturemint generates JSON fixtures from a JSON Schema plus a local recipe, then writes a manifest with file sizes and SHA-256 checksums.

## 60-second video flow

1. Open `examples/user.schema.json` and show `id`, `email`, `role`, `active`, and `profile`.
2. Open `examples/user.recipe.yaml` and show the two named files plus the role overrides.
3. Run `npm run build`.
4. Run the generate command from `docs/tutorials/generate-user-fixtures.md`.
5. Open `admin-user.json` and `viewer-user.json`.
6. Run the manifest command and show the checksum entries.
7. Close with determinism: the seed and recipe make a small fixture pack reproducible.

## Social hooks

- "Stop hand-writing every JSON fixture. Define the schema, add a recipe, and generate the pack."
- "fixturemint turns a user schema into named admin and viewer fixtures, then records checksums."
- "A tiny deterministic fixture workflow: schema, recipe, seed, output, manifest."

## Boundaries

- Do not claim broad JSON Schema coverage beyond the README's stated early-stage support for common fixture shapes.
- Do not claim fixture data is realistic customer data.
- Keep demos grounded in `examples/user.schema.json` and `examples/user.recipe.yaml`.
