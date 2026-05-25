export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JsonSchema = {
  $id?: string;
  title?: string;
  description?: string;
  type?: string | string[];
  const?: JsonValue;
  default?: JsonValue;
  examples?: JsonValue[];
  enum?: JsonValue[];
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  format?: string;
  additionalProperties?: boolean | JsonSchema;
};

export type FixtureRecipe = {
  count?: number;
  variants?: string[];
  files?: Array<{
    name: string;
    variant?: string;
    seed?: number | string;
    overrides?: Record<string, JsonValue>;
  }>;
  overrides?: Record<string, JsonValue>;
  examples?: Record<string, JsonValue>;
};

export type GenerateOptions = {
  seed: string;
  outDir: string;
  schemaPath: string;
  recipePath?: string;
  count?: number;
};

export type FixtureFile = {
  path: string;
  content: JsonValue;
};

export type ManifestEntry = {
  path: string;
  bytes: number;
  sha256: string;
};

export type FixtureManifest = {
  generatedAt: string;
  version: 1;
  files: ManifestEntry[];
};
