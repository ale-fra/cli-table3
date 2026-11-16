/** Regenerates basic-usage.md and advanced-usage.md from the examples (`pnpm docs`). */
import basicUsage from '../examples/basic-usage-examples.mts';
import colAndRowSpan from '../examples/col-and-row-span-examples.mts';
import { mdExample } from '../lib/print-example.mts';

mdExample(basicUsage, 'basic-usage.md');
mdExample(colAndRowSpan, 'advanced-usage.md');
