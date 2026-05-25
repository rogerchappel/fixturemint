#!/usr/bin/env node
import { Command } from 'commander';
import { generateFixtures } from './generate.js';
import { createManifest } from './manifest.js';

const program = new Command();

program
  .name('fixturemint')
  .description('Generate deterministic fixture packs from JSON Schema and local recipes.')
  .version('0.1.0');

program
  .command('generate')
  .argument('<schema>', 'JSON Schema file')
  .option('-r, --recipe <path>', 'YAML or JSON fixture recipe')
  .option('-s, --seed <seed>', 'deterministic seed', 'fixturemint')
  .option('-o, --out <dir>', 'output directory', 'fixtures/generated')
  .option('-c, --count <count>', 'number of fixtures to generate when no recipe files are listed', parsePositiveInt)
  .action(async (schema: string, options: { recipe?: string; seed: string; out: string; count?: number }) => {
    const files = await generateFixtures({
      schemaPath: schema,
      recipePath: options.recipe,
      seed: options.seed,
      outDir: options.out,
      count: options.count,
    });

    for (const file of files) {
      console.log(file.path);
    }
  });

program
  .command('manifest')
  .argument('<dir>', 'fixture directory')
  .option('-o, --out <path>', 'manifest output path')
  .action(async (dir: string, options: { out?: string }) => {
    const manifest = await createManifest(dir, options.out);
    if (!options.out) {
      console.log(JSON.stringify(manifest, null, 2));
    }
  });

program.parseAsync().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

function parsePositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Expected a positive integer, received "${value}"`);
  }

  return parsed;
}
