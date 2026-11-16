import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // keep describe/it/expect as globals, like Jest did
    globals: true,
    include: ['test/**/*-test.ts', 'test/**/*-tests.ts'],
    // builds src/ into dist/ before the tests run (and keeps it updated in watch mode)
    globalSetup: ['test/global-setup.ts'],
    forceRerunTriggers: ['**/package.json/**', '**/vitest.config.*/**', '**/dist/**/*.js'],
    // dist/ is CommonJS: Node.js loads it (like a dependency), so that the tests, the package
    // entry point and the modules requiring each other all share one instance of each module
    // (otherwise Vite would load a second copy for the imports of the tests).
    server: { deps: { external: [/\/dist\//] } },
    // Deterministic colour output regardless of TTY/CI: ansis and @colors/colors
    // both honour FORCE_COLOR (truecolor tests raise it to 3 via env/truecolor.ts).
    env: { FORCE_COLOR: '1' },
    coverage: {
      provider: 'v8',
      // Tests load the compiled files; the source maps report coverage against src/.
      include: ['dist/**/*.js'],
      reporter: ['text', 'html', 'json-summary'],
      // Checked for every module separately: a module without (enough) tests fails the run.
      thresholds: {
        perFile: true,
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
