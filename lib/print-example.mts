/**
 * Prints the examples of examples/ to the console or into the Markdown docs: the name of the
 * example, its output (or a screenshot) and the code of its `makeTable` function.
 */
import fs from 'node:fs';
import colors from 'ansis';
import type Table from 'cli-table3';

/**
 * Called for every example.
 * @param name - the name of the example.
 * @param makeTable - builds the table. Its body is printed as the code of the example, so it
 *   must not contain type annotations (Node.js replaces them with spaces).
 * @param expected - the lines of the expected output (checked by the tests).
 * @param screenshot - the name of a screenshot of the output, shown in the docs instead.
 */
export type ExampleRunner = (
  name: string,
  makeTable: () => Table.Table,
  expected: string[],
  screenshot?: string
) => void;

/** A set of examples: calls `runExample` for every example. */
export type Examples = (runExample: ExampleRunner) => void;

interface Printer {
  logName(name: string): void;
  logTable(table: string): void;
  logCode(code: string): void;
  logSeparator(separator: string): void;
  logScreenshot?(image: string): void;
}

function printExamples(examples: Examples, printer: Printer): void {
  examples((name, makeTable, _expected, screenshot) => {
    // the body of makeTable, without its first line and its last two lines (`return table;`, `}`)
    const code = makeTable.toString().split('\n').slice(1, -2).join('\n');

    printer.logName(name);
    if (screenshot && printer.logScreenshot) {
      printer.logScreenshot(screenshot);
    } else {
      printer.logTable(makeTable().toString());
    }
    printer.logCode(code);
    printer.logSeparator('\n');
  });
}

/** Prints the examples to the console. */
export function logExample(examples: Examples): void {
  printExamples(examples, {
    logName: (name) => console.log(`${colors.gray('=========  ')}${name}${colors.gray('  ================')}`),
    logTable: console.log,
    logCode: console.log,
    logSeparator: console.log,
    logScreenshot: () => {}, // screenshots are not shown in the console
  });
}

/** Hyperlinks are not displayed in Markdown: replaces them with their text. */
function replaceLinks(str: string): string {
  const matches = str.match(/\x1B\]8;;[^\x07]+\x07[^\]]+\x1B\]8;;\x07/g);
  if (!matches) {
    return str;
  }
  let result = str;
  for (const match of matches) {
    const [, text = ''] = match.match(/\x07([^\]|\x1B]+)\x1B/) ?? [];
    result = result.replace(match, text);
  }
  return `${result}\n\nNote: Links are not displayed in documentation examples.`;
}

/** Writes the examples into the Markdown file `file`. */
export function mdExample(examples: Examples, file: string): void {
  const buffer: string[] = [];

  printExamples(examples, {
    logName: (name) => buffer.push(`##### ${name}`),
    logTable: (table) => {
      // md files won't render color strings properly.
      const plain = replaceLinks(colors.strip(table));
      // indent the table so that it is displayed as preformatted text
      buffer.push(`    ${plain.split('\n').join('\n    ')}`);
    },
    logCode: (code) => buffer.push('```javascript', colors.strip(code), '```'),
    logSeparator: (separator) => buffer.push(colors.strip(separator)),
    logScreenshot: (image) => buffer.push(`![table image](./examples/screenshots/${image}.png)`),
  });

  fs.writeFileSync(file, buffer.join('\n'));
}
