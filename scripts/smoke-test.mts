/**
 * Smoke test of the package as users get it: packs it (like `npm publish`), installs the
 * tarball with npm into new CommonJS, ES module and TypeScript projects, and runs them.
 *
 * Usage: `pnpm smoke` (needs the npm registry to install the dependencies).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-table3-smoke-'));

// A table using the main features; the expected output is checked without colours.
const RENDER = `
  const table = new Table({ head: ['Name', 'Notes'], colWidths: [8, 16], wordWrap: true });
  table.push(
    ['cli', 'pretty tables for the command line'],
    [{ content: 'spanning both columns', colSpan: 2, hAlign: 'center' }],
  );
  const output = table.toString();
`;
const EXPECTED = [
  '┌────────┬────────────────┐',
  '│ Name   │ Notes          │',
  '├────────┼────────────────┤',
  '│ cli    │ pretty tables  │',
  '│        │ for the        │',
  '│        │ command line   │',
  '├────────┴────────────────┤',
  '│  spanning both columns  │',
  '└─────────────────────────┘',
].join('\n');
const CHECK = `
  const plain = output.replace(/\\u001b\\[[\\d;]*m/g, '');
  if (plain !== ${JSON.stringify(EXPECTED)}) {
    console.error(plain);
    throw new Error('unexpected output');
  }
  if (!output.includes('\\u001b[31m')) throw new Error('the header is not red');
  const limited = new Table({head: ['h'], maxColWidths: 6, style: {head: ['brightRed'], border: []}});
  limited.push(['abcdefgh']);
  const capped = limited.toString();
  if (!capped.includes('abcd') || !capped.includes('efgh') || capped.includes('…')) throw new Error('maxColWidths failed');
  if (!capped.includes('\\u001b[91m')) throw new Error('legacy style alias failed');
`;

const CONSUMERS: Record<string, { files: Record<string, string>; run: string[] }> = {
  commonjs: {
    files: { 'index.js': `const Table = require('cli-table3');\n${RENDER}${CHECK}console.log(output);` },
    run: ['node', 'index.js'],
  },
  'es-module': {
    files: { 'index.mjs': `import Table from 'cli-table3';\n${RENDER}${CHECK}console.log(output);` },
    run: ['node', 'index.mjs'],
  },
  typescript: {
    files: {
      'esm.mts':
        "import Table from 'cli-table3'; const table: Table.Table = new Table({ maxColWidths: [undefined, 8] }); table.push(['x']); export default table;",
      'index.ts': [
        "import Table from 'cli-table3';",
        "const options: Table.TableConstructorOptions = { maxColWidths: 12, style: { head: ['bold'], compact: true } };",
        'const typed: Table.Table = new Table(options);',
        "const cell: Table.Cell = { content: 'x', colSpan: 2, hAlign: 'right' };",
        'typed.push([cell]);',
        "// @ts-expect-error - 'middle' is not an alignment",
        "typed.push([{ content: 'y', hAlign: 'middle' }]);",
        'export const width: number = typed.width;',
      ].join('\n'),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { module: 'nodenext', strict: true, noEmit: true, skipLibCheck: false },
      }),
    },
    run: ['node', tsc, '-p', '.'],
  },
};

function run(command: string[], cwd: string): string {
  const [program = '', ...args] = command;
  return execFileSync(program, args, { cwd, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '1' } });
}

try {
  console.log('smoke: packing (clean build)...');
  run(['pnpm', 'pack', '--pack-destination', work], root);
  const [tarball] = fs.readdirSync(work).filter((file) => file.endsWith('.tgz'));
  if (!tarball) throw new Error('no tarball');

  for (const [name, consumer] of Object.entries(CONSUMERS)) {
    const dir = path.join(work, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: `smoke-${name}`, private: true }));
    for (const [file, content] of Object.entries(consumer.files)) {
      fs.writeFileSync(path.join(dir, file), content);
    }
    run(['npm', 'install', '--no-audit', '--no-fund', '--silent', path.join(work, tarball)], dir);
    const output = run(consumer.run, dir);
    console.log(`smoke: ${name} ✔`);
    if (name === 'commonjs') {
      console.log(output.trimEnd());
    }
  }
  console.log(`smoke: all consumers passed (${tarball})`);
} catch (error) {
  console.error('smoke: FAILED');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
