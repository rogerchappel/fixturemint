import path from 'node:path';
import { createRng, integerBetween, pick } from './deterministic.js';
import { readJsonSchema, readRecipe, writeJsonFile } from './io.js';
import { requiredKeys, schemaType, stableSchemaName } from './schema.js';
import type { FixtureFile, FixtureRecipe, GenerateOptions, JsonSchema, JsonValue } from './types.js';

type Rng = () => number;

export async function generateFixtures(options: GenerateOptions): Promise<FixtureFile[]> {
  const schema = await readJsonSchema(options.schemaPath);
  const recipe = await readRecipe(options.recipePath);
  const files = buildFilePlan(options, recipe);

  const generated: FixtureFile[] = [];
  for (const file of files) {
    const seed = file.seed ?? `${options.seed}:${file.name}`;
    const content = mergeObjects(
      generateValue(schema, createRng(seed), recipe, []),
      mergeRecords(recipe.overrides ?? {}, file.overrides ?? {}),
    );
    const outputPath = path.join(options.outDir, ensureJsonName(file.name));
    await writeJsonFile(outputPath, content);
    generated.push({ path: outputPath, content });
  }

  return generated;
}

export function generateValue(
  schema: JsonSchema,
  rng: Rng,
  recipe: FixtureRecipe = {},
  pathSegments: string[] = [],
): JsonValue {
  if (schema.const !== undefined) {
    return schema.const;
  }

  if (schema.examples?.length) {
    return pick(schema.examples, rng);
  }

  const recipeExample = recipe.examples?.[pathSegments.join('.')];
  if (recipeExample !== undefined) {
    return recipeExample;
  }

  if (schema.default !== undefined) {
    return schema.default;
  }

  if (schema.enum?.length) {
    return pick(schema.enum, rng);
  }

  switch (schemaType(schema)) {
    case 'object':
      return generateObject(schema, rng, recipe, pathSegments);
    case 'array':
      return generateArray(schema, rng, recipe, pathSegments);
    case 'integer':
      return integerBetween(schema.minimum ?? 1, schema.maximum ?? 1000, rng);
    case 'number':
      return Number((rng() * ((schema.maximum ?? 1000) - (schema.minimum ?? 0)) + (schema.minimum ?? 0)).toFixed(2));
    case 'boolean':
      return rng() >= 0.5;
    case 'null':
      return null;
    default:
      return generateString(schema, rng, pathSegments.at(-1));
  }
}

function generateObject(schema: JsonSchema, rng: Rng, recipe: FixtureRecipe, pathSegments: string[]): JsonValue {
  const output: Record<string, JsonValue> = {};
  const required = requiredKeys(schema);

  for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
    if (required.size > 0 && !required.has(key) && rng() < 0.35) {
      continue;
    }

    output[key] = generateValue(propertySchema, rng, recipe, [...pathSegments, key]);
  }

  return output;
}

function generateArray(schema: JsonSchema, rng: Rng, recipe: FixtureRecipe, pathSegments: string[]): JsonValue {
  const min = schema.minItems ?? 1;
  const max = schema.maxItems ?? Math.max(min, 3);
  const count = integerBetween(min, max, rng);
  const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;

  if (!itemSchema) {
    return [];
  }

  return Array.from({ length: count }, (_, index) =>
    generateValue(itemSchema, rng, recipe, [...pathSegments, String(index)]),
  );
}

function generateString(schema: JsonSchema, rng: Rng, key = 'value'): JsonValue {
  const min = schema.minLength ?? 1;
  const max = schema.maxLength ?? Math.max(min, 16);
  const length = integerBetween(min, Math.min(max, 24), rng);

  if (schema.format === 'email') {
    return `${key}.${integerBetween(100, 999, rng)}@example.test`;
  }

  if (schema.format === 'date-time') {
    return new Date(Date.UTC(2024, 0, 1, 0, 0, integerBetween(0, 86400, rng))).toISOString();
  }

  if (schema.format === 'date') {
    return `2024-01-${String(integerBetween(1, 28, rng)).padStart(2, '0')}`;
  }

  return `${key}-${base36(rng, length)}`;
}

function buildFilePlan(options: GenerateOptions, recipe: FixtureRecipe): NonNullable<FixtureRecipe['files']> {
  if (recipe.files?.length) {
    return recipe.files;
  }

  const count = options.count ?? recipe.count ?? 1;
  const baseName = stableSchemaName(options.schemaPath);
  return Array.from({ length: count }, (_, index) => ({
    name: `${baseName}-${String(index + 1).padStart(3, '0')}.json`,
    seed: `${options.seed}:${index}`,
  }));
}

function ensureJsonName(name: string): string {
  return name.endsWith('.json') ? name : `${name}.json`;
}

function base36(rng: Rng, length: number): string {
  let output = '';
  while (output.length < length) {
    output += Math.floor(rng() * Number.MAX_SAFE_INTEGER).toString(36);
  }
  return output.slice(0, length);
}

function mergeObjects(base: JsonValue, overrides: Record<string, JsonValue>): JsonValue {
  if (!isPlainObject(base)) {
    return Object.keys(overrides).length ? overrides : base;
  }

  const output: Record<string, JsonValue> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key.includes('.')) {
      setPath(output, key.split('.'), value);
      continue;
    }

    output[key] = isPlainObject(output[key]) && isPlainObject(value)
      ? mergeObjects(output[key], value)
      : value;
  }

  return output;
}

function mergeRecords(
  base: Record<string, JsonValue>,
  overrides: Record<string, JsonValue>,
): Record<string, JsonValue> {
  return mergeObjects(base, overrides) as Record<string, JsonValue>;
}

function setPath(target: Record<string, JsonValue>, segments: string[], value: JsonValue): void {
  let cursor = target;
  const leaf = segments.at(-1);
  if (!leaf) {
    return;
  }

  for (const segment of segments.slice(0, -1)) {
    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, JsonValue>;
  }

  cursor[leaf] = value;
}

function isPlainObject(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
