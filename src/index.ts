/**
 * cli-table3: pretty unicode tables for the command line.
 *
 * The package exports the Table class itself (`module.exports = Table`), as it always did:
 * `const Table = require('cli-table3')` or `import Table from 'cli-table3'`.
 */
import { Table } from './table';

export = Table;

// Makes the static `reset` visible to Node.js as a named export, so that ES modules can also
// `import { reset } from 'cli-table3'` (as the types allow).
module.exports.reset = Table.reset;
