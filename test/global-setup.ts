/**
 * The tests run against the compiled output in dist/, i.e. the code that is published.
 * Build before running tests so they never run against stale output; the build is
 * incremental, so this is fast. In watch mode, tsc keeps dist/ up to date and vitest re-runs
 * the tests when it changes (see forceRerunTriggers in vitest.config.ts).
 */
import type { TestProject } from 'vitest/node';
import { build, watch } from '../scripts/build.mts';

export default function setup(project: TestProject): (() => void) | undefined {
  build();
  if (!project.config.watch) {
    return undefined;
  }
  const watcher = watch();
  return () => watcher.stop();
}
