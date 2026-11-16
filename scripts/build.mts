/**
 * Incremental build of src/ into dist/ (see tsconfig.build.json).
 *
 * After compiling, output files whose source file no longer exists are removed. tsc does not
 * delete them, and a stale file can shadow a new module: e.g. an old dist/utils.js would be
 * loaded by require('./utils') instead of dist/utils/index.js.
 *
 * Usage: `node scripts/build.mts` (or `pnpm build`); also imported by the test setup.
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

const OUTPUT_SUFFIXES = ['.d.ts.map', '.d.ts', '.js.map', '.js'];
const SOURCE_EXTENSIONS = ['.ts', '.js'];

export function build(): void {
  execFileSync(process.execPath, [tsc, '-b', 'tsconfig.build.json'], { cwd: root, stdio: 'inherit' });
  for (const file of staleOutputs(distDir)) {
    fs.rmSync(file);
    console.log(`build: removed stale ${path.relative(root, file)}`);
  }
}

/** Starts `tsc --watch` (the stale outputs are only removed by `build`). */
export function watch(): { stop(): void } {
  const watcher = spawn(process.execPath, [tsc, '-b', 'tsconfig.build.json', '--watch', '--preserveWatchOutput'], {
    cwd: root,
    stdio: 'inherit',
  });
  return { stop: () => watcher.kill() };
}

function* staleOutputs(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* staleOutputs(file);
    } else if (!hasSource(file)) {
      yield file;
    }
  }
}

function hasSource(outputFile: string): boolean {
  const suffix = OUTPUT_SUFFIXES.find((s) => outputFile.endsWith(s));
  if (!suffix) return true; // not a compiler output: leave it alone
  const base = path.join(srcDir, path.relative(distDir, outputFile.slice(0, -suffix.length)));
  return SOURCE_EXTENSIONS.some((ext) => fs.existsSync(base + ext));
}

// run as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    build();
  } catch {
    process.exitCode = 1; // tsc has already printed the errors
  }
}
