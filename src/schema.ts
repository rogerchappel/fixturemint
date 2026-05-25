import type { JsonSchema } from './types.js';

export function schemaType(schema: JsonSchema): string {
  if (typeof schema.type === 'string') {
    return schema.type;
  }

  if (Array.isArray(schema.type) && schema.type.length > 0) {
    return schema.type.find((type) => type !== 'null') ?? schema.type[0] ?? 'string';
  }

  if (schema.properties) {
    return 'object';
  }

  if (schema.items) {
    return 'array';
  }

  if (schema.enum?.length) {
    return typeof schema.enum[0];
  }

  return 'string';
}

export function stableSchemaName(schemaPath: string): string {
  const file = schemaPath.split(/[\\/]/).pop() ?? 'fixture';
  return file.replace(/\.(schema\.)?json$/i, '').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-|-$/g, '') || 'fixture';
}

export function requiredKeys(schema: JsonSchema): Set<string> {
  return new Set(schema.required ?? []);
}
