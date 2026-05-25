import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import type { FixtureRecipe, JsonSchema, JsonValue } from './types.js';

export async function readJsonSchema(filePath: string): Promise<JsonSchema> {
  return JSON.parse(await readFile(filePath, 'utf8')) as JsonSchema;
}

export async function readRecipe(filePath?: string): Promise<FixtureRecipe> {
  if (!filePath) {
    return {};
  }

  const raw = await readFile(filePath, 'utf8');
  const parsed = filePath.endsWith('.json') ? JSON.parse(raw) : YAML.parse(raw);
  return (parsed ?? {}) as FixtureRecipe;
}

export async function writeJsonFile(filePath: string, value: JsonValue): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function toJsonValue(value: unknown): JsonValue {
  return value as JsonValue;
}
