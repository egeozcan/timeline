import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import test from 'node:test';

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  encoding: 'utf8',
});
const packResult = JSON.parse(packOutput);
assert.equal(packResult.length, 1, 'npm pack should describe exactly one tarball');

const packedFiles = new Set(packResult[0].files.map(({ path }) => path));

const requiredFiles = [
  'dist/index.js',
  'dist/components/timeline-component.js',
  'dist/components/timeline-component.d.ts',
  'dist/components/timeline-event.js',
  'dist/components/timeline-event.d.ts',
  'src/styles/theme-dark.css',
  'src/styles/theme-light.css',
  'src/styles/theme-modern.css',
  'custom-elements.json',
  'README.md',
  'LICENSE',
];

const forbiddenPrefixes = ['stories/', 'test/', 'coverage/', 'storybook-static/'];

function packagePathFor(specifier) {
  const resolvedPath = fileURLToPath(import.meta.resolve(specifier));
  return resolvedPath.slice(fileURLToPath(new URL('../../', import.meta.url)).length);
}

test('packed package includes all public runtime and metadata files', () => {
  for (const file of requiredFiles) {
    assert.ok(packedFiles.has(file), `expected packed package to include ${file}`);
  }
});

test('packed package excludes development output and source TypeScript', () => {
  for (const file of packedFiles) {
    assert.ok(
      !forbiddenPrefixes.some((prefix) => file.startsWith(prefix)),
      `expected packed package to exclude ${file}`
    );
    assert.ok(
      !(file.startsWith('src/') && /\.tsx?$/.test(file)),
      `expected packed package to exclude source TypeScript ${file}`
    );
  }
});

test('custom elements manifest exposes only published component modules', async () => {
  const manifest = JSON.parse(await readFile('custom-elements.json', 'utf8'));
  assert.deepEqual(
    manifest.modules.map(({ path }) => path),
    ['dist/components/timeline-component.js', 'dist/components/timeline-event.js']
  );
});

test('package exports resolve to packed files and reject the legacy theme path', async () => {
  const publicSpecifiers = [
    'lit-timeline',
    'lit-timeline/timeline-event.js',
    'lit-timeline/timeline-component.js',
    'lit-timeline/styles/theme-dark.css',
  ];

  for (const specifier of publicSpecifiers) {
    const packagePath = packagePathFor(specifier);
    assert.ok(
      packedFiles.has(packagePath),
      `${specifier} resolved to unpacked file ${packagePath}`
    );
  }

  assert.throws(() => import.meta.resolve('lit-timeline/dist/styles/theme-dark.css'), {
    code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
  });

  const documentation = await Promise.all(
    ['README.md', 'AGENTS.md'].map((path) => readFile(path, 'utf8'))
  );
  assert.ok(
    documentation.every((contents) => !contents.includes('lit-timeline/dist/styles')),
    'documentation must not refer to the unexported dist/styles path'
  );
});
