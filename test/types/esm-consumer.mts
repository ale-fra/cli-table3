/**
 * Type test: an ES module importing the package. Checked by `pnpm typecheck` (not run).
 */
import Table from 'cli-table3';

const options: Table.TableConstructorOptions = { head: ['a'] };
const table: Table.Table = new Table(options);
table.push(['b']);

export const output: string = table.toString();
