/**
 * Type test: the API added or changed in 1.0. Checked by `pnpm typecheck` (not run).
 */
import Table = require('cli-table3');

const table = new Table({ debug: 3, head: ['a'], colWidths: undefined, style: { 'padding-left': undefined } });
table.push(['b']);

const messages: string[] | undefined = table.messages;
Table.reset(); // deprecated, still available
const style: Table.TableStyle = table.options.style;
const wordWrap: boolean | undefined = table.options.wordWrap;
const mapped: string[] = table.map((row) => JSON.stringify(row));
const filtered: Table.TableRow[] = table.filter(() => true);

// @ts-expect-error - not an alignment
new Table({ colAligns: ['middle'] });
// @ts-expect-error - unknown option
new Table({ colWidth: [1] });
// @ts-expect-error - the content of a cell is a primitive value
const nested: Table.Cell = { content: { text: 'x' } };
// @ts-expect-error - options are read-only on the table
table.options = new Table().options;

export { filtered, mapped, messages, nested, style, wordWrap };

new Table({ maxColWidths: 12 });
new Table({ maxColWidths: [null, 12] });
// @ts-expect-error - limits must be numeric
new Table({ maxColWidths: ['12'] });
new Table({ maxColWidths: [undefined, 8] });
