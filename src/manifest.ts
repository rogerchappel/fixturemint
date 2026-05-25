import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FixtureManifest, ManifestEntry } from './types.js';

export async function createManifest(dir: string, outPath?: string): Promise<FixtureManifest> {
  const files = await collectFiles(dir);
  const resolvedOut = outPath ? path.resolve(outPath) : undefined;
  const entries: ManifestEntry[] = [];

  for (const filePath of files) {
    if (resolvedOut && path.resolve(filePath) === resolvedOut) {
      continue;
    }

    const bytes = await readFile(filePath);
    entries.push({
      path: normalizePath(path.relative(dir, filePath)),
      bytes: bytes.byteLength,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }

  const manifest: FixtureManifest = {
    generatedAt: new Date().toISOString(),
    version: 1,
    files: entries.sort((a, b) => a.path.localeCompare(b.path)),
  };

  if (outPath) {
    await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  return manifest;
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry);
    const info = await stat(filePath);
    if (info.isDirectory()) {
      files.push(...await collectFiles(filePath));
    } else if (info.isFile()) {
      files.push(filePath);
    }
  }

  return files;
}

function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}
