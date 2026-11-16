import usage from '../examples/basic-usage-examples.mts';
import examples from '../examples/col-and-row-span-examples.mts';
import type { Examples } from '../lib/print-example.mts';

/** Checks that every example renders its expected output. */
function runTest(name: string, exampleSet: Examples): void {
  describe(name, () => {
    exampleSet((exampleName, makeTable, expected) => {
      it(exampleName, () => {
        expect(makeTable().toString()).toEqual(expected.join('\n'));
      });
    });
  });
}

runTest('@api Usage', usage);
runTest('@api Table (examples)', examples);
