import { execFileSync } from 'node:child_process';
import path from 'node:path';

/** Runs `code` in a new Node.js process inside the package, which imports itself by name. */
function run(code: string, type: 'commonjs' | 'module' = 'commonjs'): string {
  return execFileSync(process.execPath, ['--input-type', type, '-e', code], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });
}

describe('package entry points', () => {
  const rendered = ['┌───┐', '│ a │', '└───┘'].join('\n');
  const render = "const t = new Table({ style: { head: [], border: [] } }); t.push(['a']); console.log(t.toString());";

  it("require('cli-table3') returns the Table class", () => {
    expect(run(`const Table = require('cli-table3'); ${render}`).trim()).toEqual(rendered);
  });

  it("import Table from 'cli-table3' (ES module)", () => {
    expect(run(`import Table from 'cli-table3'; ${render}`, 'module').trim()).toEqual(rendered);
  });

  it("the deprecated Table.reset is also a named export (import { reset } from 'cli-table3')", () => {
    expect(
      run("import Table, { reset } from 'cli-table3'; console.log(String(reset === Table.reset))", 'module').trim()
    ).toEqual('true');
  });

  it('internal modules are not part of the public API', () => {
    expect(() => run("require('cli-table3/dist/table')")).toThrow(/ERR_PACKAGE_PATH_NOT_EXPORTED/);
  });

  it('package.json can be read', () => {
    expect(run("console.log(require('cli-table3/package.json').name)").trim()).toEqual('cli-table3');
  });
});
