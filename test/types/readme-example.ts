/**
 * Type test: the TypeScript example of the README ("TypeScript and ES modules").
 */
import Table from 'cli-table3';

const options: Table.TableConstructorOptions = { head: ['Name', 'Value'], colWidths: [10, 20] };
const table: Table.Table = new Table(options);
table.push(['a', 1], [{ content: 'spans both columns', colSpan: 2 }]);
console.log(table.toString());
