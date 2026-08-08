import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const manifestPath = 'custom-elements.json';
const pathMappings = new Map([
  ['src/components/timeline-component.ts', 'dist/components/timeline-component.js'],
  ['src/components/timeline-event.ts', 'dist/components/timeline-event.js'],
]);

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.ok(Array.isArray(manifest.modules), 'custom-elements.json must contain a modules array');
assert.equal(
  manifest.modules.length,
  pathMappings.size,
  'custom-elements.json must contain exactly the public component modules'
);

const sourcePaths = manifest.modules.map(({ path }) => path);
for (const sourcePath of sourcePaths) {
  assert.ok(pathMappings.has(sourcePath), `Unexpected custom elements module path: ${sourcePath}`);
}
for (const expectedPath of pathMappings.keys()) {
  assert.ok(
    sourcePaths.includes(expectedPath),
    `Missing custom elements module path: ${expectedPath}`
  );
}

for (const module of manifest.modules) {
  module.path = pathMappings.get(module.path);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
