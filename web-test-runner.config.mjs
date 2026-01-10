import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/unit/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'auto',
      tsconfig: './tsconfig.json',
    }),
  ],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  filterBrowserLogs(log) {
    // Suppress ResizeObserver errors which are common in tests
    if (log.args?.some((arg) => typeof arg === 'string' && arg.includes('ResizeObserver'))) {
      return false;
    }
    return true;
  },
  testRunnerHtml: (testFramework) =>
    `<html>
      <head>
        <script>
          // Suppress ResizeObserver loop errors before any other scripts load
          window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('ResizeObserver')) {
              e.stopImmediatePropagation();
              e.preventDefault();
              return true;
            }
          }, true);

          // Also patch onerror
          const originalOnerror = window.onerror;
          window.onerror = function(message, source, lineno, colno, error) {
            if (message && typeof message === 'string' && message.includes('ResizeObserver')) {
              return true;
            }
            return originalOnerror ? originalOnerror(message, source, lineno, colno, error) : false;
          };
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
  coverage: true,
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
