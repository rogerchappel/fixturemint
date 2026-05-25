# FixtureMint PRD

Status: in-progress

## Summary

FixtureMint creates small deterministic fixture packs from JSON schemas and seed files. It helps CLI authors and agents build realistic tests quickly without relying on random data or external services.

## Problem

Fixtures are either hand-written and sparse, or generated with unstable randomness. Local-first developer tools need predictable sample workspaces, manifests, logs, and API payloads that still cover edge cases.

## V1 Scope

- Read JSON Schema files and YAML/JSON fixture recipes.
- Generate deterministic JSON fixtures from a seed.
- Support examples, required fields, enum values, arrays, nested objects, and edge-case variants.
- Write a fixture manifest with checksums.
- Include tests and smoke examples.

## Non-Goals

- Full property-based testing engine.
- Network API mocking.
- PII-like realistic data generation.

## CLI

```bash
fixturemint generate schema.json --seed 42 --out fixtures/generated
fixturemint manifest fixtures/generated --out fixtures/manifest.json
```

## Source Attribution

Inspired by JSON Schema example generators and test data builders, reframed as a deterministic fixture-pack maker for local CLI projects.
