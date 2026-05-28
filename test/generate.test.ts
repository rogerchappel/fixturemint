import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generateFixtures } from '../src/generate.js';
import { createManifest } from '../src/manifest.js';

test('generates deterministic fixtures from a schema and recipe', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fixturemint-'));
  try {
    const schemaPath = path.join(dir, 'user.schema.json');
    const recipePath = path.join(dir, 'user.recipe.json');
    const outDir = path.join(dir, 'out');

    await writeFile(schemaPath, JSON.stringify({
      type: 'object',
      required: ['id', 'email', 'role'],
      properties: {
        id: { type: 'integer', minimum: 1, maximum: 10 },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['admin', 'member'] },
      },
    }), 'utf8');
    await writeFile(recipePath, JSON.stringify({
      files: [{ name: 'sample.json', seed: 'case-a', overrides: { role: 'admin' } }],
    }), 'utf8');

    const first = await generateFixtures({ schemaPath, recipePath, seed: 'root', outDir });
    const second = await generateFixtures({ schemaPath, recipePath, seed: 'root', outDir: path.join(dir, 'out2') });

    assert.equal(first.length, 1);
    assert.deepEqual(first[0]?.content, second[0]?.content);
    assert.equal((first[0]?.content as { role: string }).role, 'admin');
    assert.match(await readFile(path.join(outDir, 'sample.json'), 'utf8'), /"role": "admin"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('creates a checksum manifest for generated files', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fixturemint-'));
  try {
    await writeFile(path.join(dir, 'one.json'), '{"ok":true}\n', 'utf8');
    const manifestPath = path.join(dir, 'nested', 'manifest.json');
    const manifest = await createManifest(dir, manifestPath);

    assert.equal(manifest.version, 1);
    assert.deepEqual(manifest.files.map((file) => file.path), ['one.json']);
    assert.equal(manifest.files[0]?.bytes, 12);
    assert.match(manifest.files[0]?.sha256 ?? '', /^[a-f0-9]{64}$/);
    assert.match(await readFile(manifestPath, 'utf8'), /"path": "one.json"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
