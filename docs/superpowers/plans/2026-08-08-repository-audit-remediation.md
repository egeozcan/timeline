# Repository Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every repository-audit finding through four isolated, parallel worktree lanes and integrate them into a deterministic, publishable Lit timeline package.

**Architecture:** Four worktree lanes own disjoint seams: event/date behavior, timeline layout/runtime, packaging/CI/documentation, and deterministic visual testing. Lanes B, C, and D start concurrently. After Lane B’s reviewed commit provides `isValidDate(dateString: string): boolean`, Lane A branches from that commit while C and D continue. The controller reviews each lane, integrates commits serially in B → A → C → D order, resolves only cross-lane seams, and runs complete validation.

**Tech Stack:** TypeScript 5.7, Lit 3, Web Test Runner, Playwright, Storybook 8, Custom Elements Manifest Analyzer, GitHub Actions, npm.

## Global Constraints

- Preserve existing element names, primary attributes, CSS parts, and horizontal/vertical/list modes.
- Minor behavior changes are allowed and must be documented.
- Direct valid `<timeline-event>` children are automatically reordered chronologically in the light DOM.
- Invalid or missing dates are hidden, excluded from layout, and produce a deterministic console warning; lifecycle callbacks must not throw.
- Vertical timelines below 600px are one-sided with the axis on the left and no horizontal scrolling; layouts at 600px and above alternate sides.
- Screenshot regressions run in Chromium on `ubuntu-24.04`; behavioral and accessibility coverage remains Chromium, Firefox, and WebKit.
- Every production behavior change follows red-green-refactor, with the failing command and expected failure recorded before implementation.
- Agents may edit and commit only inside their assigned worktree; they must not push, merge, publish, or update unrelated files.

---

## Parallel Execution Map

Tasks 1, 3, and 4 launch concurrently in isolated worktrees from the design baseline commit. Task 2 launches from Task 1’s reviewed commit as soon as Lane B finishes, while Tasks 3 and 4 continue. Task 5 begins only after all four lane reviews pass.

| Task | Lane        | Primary ownership                           | Dependency                             |
| ---- | ----------- | ------------------------------------------- | -------------------------------------- |
| 1    | B           | Event/date/accessibility API                | Produces `isValidDate` contract        |
| 2    | A           | Timeline layout/runtime                     | Branches from Task 1’s reviewed commit |
| 3    | C           | Packaging/CI/docs                           | Uses design contract only              |
| 4    | D           | Visual/accessibility determinism            | Uses design contract only              |
| 5    | Integration | Merge, cross-lane fixes, final verification | Tasks 1–4                              |

### Task 1: Lane B — Event, date, and accessibility API

**Files:**

- Modify: `src/utils/date-utils.ts`
- Modify: `src/components/timeline-event.ts`
- Modify: `src/styles/timeline-event.styles.ts`
- Modify: `src/types/index.ts`
- Modify: `src/index.ts`
- Test: `test/unit/date-utils.test.ts`
- Test: `test/unit/timeline-event.test.ts`

**Interfaces:**

- Produces: `isValidDate(dateString: string): boolean`, exported from `src/utils/date-utils.ts` and `src/index.ts`.
- Preserves: `formatDate(string): string`, `parseDate(string): number`, and `createDate(string): Date`; invalid input returns `''`, `NaN`, and `Invalid Date` respectively.
- Produces: `TimelineEvent.imageAlt: string`, reflected as `image-alt`, default `''`.
- Produces internal parent contract: `data-timeline-managed`, `data-layout-mode`, and `data-invalid-date` host attributes. The parent owns managed/layout attributes; the event owns invalid-date state.

- [ ] **Step 1: Add strict date-validation tests**

Add focused assertions to `test/unit/date-utils.test.ts`:

```ts
import { createDate, formatDate, isValidDate, parseDate } from '../../dist/utils/date-utils.js';

it('accepts only canonical calendar dates', () => {
  expect(isValidDate('2024-02-29')).to.be.true;
  expect(isValidDate('2023-02-29')).to.be.false;
  expect(isValidDate('2024-02-30')).to.be.false;
  expect(isValidDate('2024-2-09')).to.be.false;
  expect(isValidDate('')).to.be.false;
});

it('returns stable invalid values instead of normalized dates', () => {
  expect(formatDate('2024-02-30')).to.equal('');
  expect(Number.isNaN(parseDate('2024-02-30'))).to.be.true;
  expect(Number.isNaN(createDate('2024-02-30').getTime())).to.be.true;
});
```

Extend `formatDate` tests to assert the formatter is constructed with UTC semantics by verifying canonical input remains the same calendar day; production must explicitly set `timeZone: 'UTC'`.

- [ ] **Step 2: Run the date tests and verify RED**

Run:

```bash
npm run build && npm test -- --files test/unit/date-utils.test.ts
```

Expected: compilation or test failure because `isValidDate` is not exported and impossible dates currently normalize.

- [ ] **Step 3: Implement canonical UTC date utilities**

Implement one parser shape in `src/utils/date-utils.ts`:

```ts
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDate(dateString: string): boolean {
  const match = DATE_PATTERN.exec(dateString);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const date = new Date(0);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}
```

Guard existing helpers with `isValidDate` and set `timeZone: 'UTC'` in `formatDate`.

- [ ] **Step 4: Run the date tests and verify GREEN**

Run the Step 2 command. Expected: all date utility tests pass in Chromium, Firefox, and WebKit.

- [ ] **Step 5: Add failing standalone/accessibility/reactivity tests**

Add this local helper:

```ts
async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}
```

For warning assertions, use this local pattern; do not add a mocking dependency:

```ts
const warnings: string[] = [];
const originalWarn = console.warn;
try {
  console.warn = (message?: unknown) => warnings.push(String(message));
  // Create or update the invalid event, then assert warnings exactly.
} finally {
  console.warn = originalWarn;
}
```

Add tests to `test/unit/timeline-event.test.ts` covering these observable behaviors:

```ts
it('is visible and keyboard focusable when standalone', async () => {
  const el = await fixture<TimelineEvent>(html`
    <timeline-event date="2024-03-15"><h3>Standalone</h3></timeline-event>
  `);
  expect(getComputedStyle(el).visibility).to.equal('visible');
  expect(getComputedStyle(el).position).to.equal('relative');
  expect(el.tabIndex).to.equal(0);
});

it('uses consumer-provided image alternative text', async () => {
  const el = await fixture<TimelineEvent>(html`
    <timeline-event date="2024-03-15" image-src="test.jpg" image-alt="Team at launch">
      <h3>Launch</h3>
    </timeline-event>
  `);
  expect(el.shadowRoot!.querySelector('img')!.getAttribute('alt')).to.equal('Team at launch');
});

it('treats default images and placeholders as decorative', async () => {
  const image = await fixture<TimelineEvent>(html`
    <timeline-event date="2024-03-15" image-src="test.jpg"><h3>Launch</h3></timeline-event>
  `);
  expect(image.shadowRoot!.querySelector('img')!.getAttribute('alt')).to.equal('');

  const placeholder = await fixture<TimelineEvent>(html`
    <timeline-event date="2024-03-15"><h3>Launch</h3></timeline-event>
  `);
  expect(
    placeholder.shadowRoot!.querySelector('.image-placeholder')!.getAttribute('aria-hidden')
  ).to.equal('true');
});

it('updates its accessible name when slotted heading text changes', async () => {
  const el = await fixture<TimelineEvent>(html`
    <timeline-event date="2024-03-15"><h3>Before</h3></timeline-event>
  `);
  el.querySelector('h3')!.textContent = 'After';
  await nextFrame();
  expect(el.shadowRoot!.querySelector('[role="article"]')!.getAttribute('aria-label')).to.equal(
    'After'
  );
});
```

Also test that invalid dates set `data-invalid-date`, result in `display: none`, warn once per invalid value, and remove invalid state after assigning a valid date. Stub `console.warn` with the local collector only around the warning assertion and restore it in `finally`.

- [ ] **Step 6: Run event tests and verify RED**

Run:

```bash
npm run build && npm test -- --files test/unit/timeline-event.test.ts
```

Expected: standalone visibility/tabindex, `image-alt`, decorative placeholder, reactive title, and invalid-state assertions fail.

- [ ] **Step 7: Implement the event host contract**

Make standalone defaults relative, visible, and `tabindex="0"`. Add managed-state CSS:

```css
:host {
  position: relative;
  visibility: visible;
}

:host([data-timeline-managed]) {
  position: absolute;
  visibility: hidden;
}

:host([data-timeline-managed][data-layout-ready]),
:host([data-layout-mode='list']) {
  visibility: visible;
}

:host([data-invalid-date]) {
  display: none;
}
```

Add `imageAlt`, a subtree `MutationObserver` that requests an update when slotted heading text changes, and lifecycle-safe observer setup/cleanup. On each date change, validate it, toggle `data-invalid-date`, and warn exactly once for each distinct invalid value:

```ts
console.warn(`[timeline-event] Invalid date "${this.date}"; expected YYYY-MM-DD.`);
```

Render a single `<time>` element. Hide it visually by default and expose it under `data-layout-mode="list"`. Images use `alt=${this.imageAlt}`; placeholders use `aria-hidden="true"` and no image role.

Wire documented visual CSS variables into `.card`, placeholder, slotted heading, and slotted paragraph rules. Do not invent new variables beyond `image-alt` and the documented list.

- [ ] **Step 8: Run event/date tests and verify GREEN**

Run:

```bash
npm run build && npm test -- --files test/unit/date-utils.test.ts test/unit/timeline-event.test.ts
```

Expected: both suites pass in all three browsers with no Lit warnings introduced by the change.

- [ ] **Step 9: Commit Lane B**

```bash
git add src test/unit
git commit -m "fix: harden timeline event dates and accessibility"
```

Record the failing commands, passing commands, changed files, and commit SHA in the lane report.

### Task 2: Lane A — Timeline layout and runtime

**Files:**

- Modify: `src/components/timeline-component.ts`
- Modify: `src/styles/timeline-component.styles.ts`
- Modify: `web-test-runner.config.mjs`
- Test: `test/unit/timeline-component.test.ts`

**Interfaces:**

- Consumes: `isValidDate(dateString: string): boolean` from `../utils/date-utils.js`.
- Consumes event host attributes: `data-timeline-managed`, `data-layout-mode`, `data-layout-ready`, and `data-invalid-date`.
- Produces: one direct slot event collection shared by layout, DOM order, and keyboard navigation.

- [ ] **Step 1: Add failing dynamic-child and ordering tests**

Extend `test/unit/timeline-component.test.ts` with observable tests that:

- Append a valid event after first render and assert it becomes visible, gains a dot, and joins roving tabindex.
- Remove an event and assert its dot disappears and its standalone state/tabindex are restored.
- Change an event date and assert chronological DOM order and dot/card position change.
- Author dates September then March and assert `Array.from(el.children)` becomes March then September.
- Nest another timeline and assert outer dot/tabindex counts include only direct children.
- Replace the existing no-op sorting test with coordinate, DOM-order, and keyboard-order assertions.

Use a shared test helper:

```ts
async function settleLayout(el: TimelineComponent): Promise<void> {
  await el.updateComplete;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}
```

- [ ] **Step 2: Run focused component tests and verify RED**

Run:

```bash
npm run build && npm test -- --files test/unit/timeline-component.test.ts
```

Expected: dynamic append/remove/date and chronological DOM-order assertions fail.

- [ ] **Step 3: Implement direct-slot collection and coalesced invalidation**

Give the default slot an identifier and `slotchange` handler. Replace descendant `querySelectorAll` calls with `slot.assignedElements({ flatten: false })` filtered to direct `TIMELINE-EVENT` elements.

Maintain:

```ts
private _events: TimelineEvent[] = [];
private _eventMutationObserver = new MutationObserver(() => this._scheduleLayout());
private _eventResizeObserver = new ResizeObserver(() => this._scheduleLayout());
private _layoutScheduled = false;
private _reorderingEvents = false;
```

On slot change:

1. Restore removed elements to standalone attributes/styles/tabindex.
2. Mark current elements managed.
3. Observe only current elements for `date` changes and size changes.
4. Partition valid/invalid events using `isValidDate`.
5. Sort valid events by timestamp, append them in chronological order under `_reorderingEvents`, and append hidden invalid events last.
6. Refresh roving tabindex while preserving the currently focused direct event.
7. Schedule one layout pass with `requestAnimationFrame`.

- [ ] **Step 4: Run dynamic/order tests and verify GREEN**

Run the Step 2 command. Expected: dynamic and ordering tests pass in all browsers.

- [ ] **Step 5: Add failing range, empty, transition, reconnect, and resize tests**

Add tests for:

- `start-year` alone and `end-year` alone changing marker/range output.
- Runtime changes to each bound.
- Reversed bounds producing no SVG paths/dots and one deterministic warning.
- Empty horizontal, vertical, and list timelines having no 1800px overflow.
- Removing the final event clearing SVG and owned dimensions.
- Horizontal → vertical, vertical → horizontal, and list → horizontal matching a fresh destination-mode component.
- Detach/reconnect followed by parent resize.
- Vertical parent width changing in both directions without an inline frozen width.

- [ ] **Step 6: Run range/lifecycle tests and verify RED**

Run the Step 2 command. Expected: one-sided bounds, runtime bounds, empty overflow, transition equivalence, and reconnect responsiveness fail.

- [ ] **Step 7: Implement range and lifecycle corrections**

Recalculate on `startYear` and `endYear` changes. Compute automatic bounds first, then override each defined side independently. Use UTC month operations and explicit month boundaries. Validate `startDate <= endDate`; warn once with:

```ts
console.warn(
  `[timeline-component] Invalid range ${this.startYear}–${this.endYear}; start-year must not exceed end-year.`
);
```

Before every mode calculation, clear all inline dimensions and per-event layout styles owned by other modes. Resolve events before applying minimum content dimensions. Empty or invalid ranges clear `_eventLayouts`, `_svgData`, dimensions, and layout-ready attributes.

Set up wrapper observation after render on every connection and disconnect all observers on disconnection. Never assign `container.style.width` to its measured width.

- [ ] **Step 8: Run range/lifecycle tests and verify GREEN**

Run the Step 2 command. Expected: all component unit tests pass in all browsers.

- [ ] **Step 9: Add failing geometry and nested-shadow keyboard tests**

Add Web Test Runner assertions for:

- 320px and 375px vertical timelines: axis near the left, every event on the right, every card coordinate non-negative, and no horizontal overflow.
- 600px vertical timeline: alternating sides remain enabled.
- Events exactly at explicit range boundaries remain inside scrollable content.
- Nested-shadow-root Arrow/Home/End navigation follows chronological order.
- Pointer/programmatic focus updates the roving active event.
- An omitted or empty `label` produces the accessible region name `Timeline`.
- List mode applies `role="list"` to the collection and `role="listitem"` to event hosts.

- [ ] **Step 10: Run geometry/keyboard tests and verify RED**

Run:

```bash
npm run build && npm test -- --files test/unit/timeline-component.test.ts
```

Expected: negative mobile geometry, nested-shadow navigation, focus synchronization, accessible-label fallback, and list semantics assertions fail.

- [ ] **Step 11: Implement responsive geometry and composed keyboard navigation**

Use the component event’s `composedPath()` to identify a direct focused event. Synchronize roving tabindex on `focusin` without moving focus.

For horizontal boundaries use a margin of at least `maxCardWidth / 2 + 30`; for vertical boundaries use at least `maxCardHeight / 2 + 30`. At widths below 600px set axis X to 24px, event X to 54px, and event inline `maxWidth` to `containerWidth - 70px`. At 600px and above clear mobile max-width and alternate sides. Ensure content dimensions include every resulting non-negative rectangle.

Apply list semantics and `data-layout-mode` consistently. Render `aria-label=${this.label.trim() || 'Timeline'}` so the focusable region is never unnamed. Set `data-layout-ready` only after positions are applied.

Remove the global ResizeObserver exception suppression from `web-test-runner.config.mjs`. The focused suite must complete without ResizeObserver loop errors or the Lit warning about scheduling an update immediately after an update completed; coalesced animation-frame layout scheduling is the production fix, not log filtering.

- [ ] **Step 12: Run Lane A tests and verify GREEN**

Run:

```bash
npm run build
npm test -- --files test/unit/timeline-component.test.ts
```

Expected: all focused tests pass without ResizeObserver loop suppression hiding a new error.

- [ ] **Step 13: Commit Lane A**

```bash
git add src/components/timeline-component.ts src/styles/timeline-component.styles.ts web-test-runner.config.mjs test/unit/timeline-component.test.ts
git commit -m "fix: make timeline layout reactive and responsive"
```

Record RED/GREEN evidence and commit SHA in the lane report.

### Task 3: Lane C — Packaging, CI, metadata, and documentation

**Files:**

- Modify: `package.json`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `.github/workflows/publish.yml`
- Create: `.github/workflows/ci.yml`
- Create: `custom-elements-manifest.config.mjs`
- Create: `scripts/rewrite-custom-elements-manifest.mjs`
- Create: `test/package/package-smoke.mjs`
- Create: `LICENSE`

**Interfaces:**

- Consumes documented component behavior from the design spec.
- Produces npm scripts: `test:unit`, `test:package`, `analyze`, and `ci`.
- Preserves `npm test` as the primary fresh-checkout-safe functional test command.

- [ ] **Step 1: Add a package smoke test that initially fails**

Create `test/package/package-smoke.mjs` using only Node built-ins. It must:

1. Run `npm pack --dry-run --json` and parse the JSON payload.
2. Assert the tarball includes `dist/index.js`, component JS/declarations, `src/styles/theme-{dark,light,modern}.css`, `custom-elements.json`, `README.md`, and `LICENSE`.
3. Assert it does not include stories, tests, coverage, Storybook output, or source TypeScript.
4. Read `custom-elements.json` and assert its module paths are exactly:

```js
['dist/components/timeline-component.js', 'dist/components/timeline-event.js'];
```

5. Assert `import.meta.resolve('lit-timeline')`, `import.meta.resolve('lit-timeline/timeline-event.js')`, `import.meta.resolve('lit-timeline/timeline-component.js')`, and `import.meta.resolve('lit-timeline/styles/theme-dark.css')` resolve to packed files; resolving `lit-timeline/dist/styles/theme-dark.css` must fail and must not appear in documentation.

Invoke the dry run as `npm pack --dry-run --json --ignore-scripts` so lifecycle output cannot corrupt the JSON payload; `build` and `analyze` run explicitly before this smoke test.

- [ ] **Step 2: Run package smoke test and verify RED**

Run:

```bash
npm run build && npm run analyze && node test/package/package-smoke.mjs
```

Expected: manifest module list and missing `LICENSE` assertions fail.

- [ ] **Step 3: Restrict and rewrite CEM output**

Create `custom-elements-manifest.config.mjs`:

```js
export default {
  globs: ['src/components/timeline-component.ts', 'src/components/timeline-event.ts'],
  litelement: true,
};
```

Create `scripts/rewrite-custom-elements-manifest.mjs` that parses `custom-elements.json`, rewrites only:

- `src/components/timeline-component.ts` → `dist/components/timeline-component.js`
- `src/components/timeline-event.ts` → `dist/components/timeline-event.js`

It must reject any unexpected module path rather than silently publishing it. Update `analyze` to run CEM with the config followed by this script.

- [ ] **Step 4: Make test scripts fresh-checkout safe**

Set scripts so `npm test` always builds current source before functional tests while watch mode avoids recursive builds:

```json
{
  "pretest": "npm run build",
  "test": "npm run test:unit",
  "test:unit": "web-test-runner",
  "test:watch": "npm run build && web-test-runner --watch",
  "test:package": "npm run build && npm run analyze && node test/package/package-smoke.mjs",
  "ci": "npm run lint && npm run format:check && npm test && npm run test:package"
}
```

Avoid duplicate builds inside `ci` beyond the explicit test/package contracts unless measurements show they cause a real problem.

- [ ] **Step 5: Add CI and release validation**

Create `.github/workflows/ci.yml` on pull requests and pushes to `master`. Use Node 20, `npm ci`, install Playwright browsers with dependencies, run `npm run ci`, build Storybook, and run accessibility/visual tests according to Lane D’s final scripts.

Update `.github/workflows/publish.yml` to run `npm run ci` and `npm run build-storybook` before `npm publish`; retain OIDC/provenance permissions.

- [ ] **Step 6: Correct package documentation and licensing**

Add the canonical MIT license with copyright `2026 egecan`.

Update README and AGENTS:

- Bundler theme import: `@import 'lit-timeline/styles/theme-dark.css';`
- Direct file link: `node_modules/lit-timeline/src/styles/theme-dark.css`.
- Document strict dates, invalid-event hiding/warning, chronological DOM reordering, one-sided mobile vertical layout, standalone event visibility, and `image-alt`.
- Correct CSS variable tables to match implemented properties.
- Describe `npm test` as build + cross-browser unit tests and document `npm run test:unit` for already-built output.
- Remove every claim that theme files exist under `dist/styles`.

- [ ] **Step 7: Run packaging tests and verify GREEN**

Run:

```bash
npm run ci
npm run build-storybook
node test/package/package-smoke.mjs
```

Expected: every command passes.

- [ ] **Step 8: Commit Lane C**

```bash
git add package.json README.md AGENTS.md .github custom-elements-manifest.config.mjs scripts test/package LICENSE
git commit -m "ci: validate published timeline package"
```

- [ ] **Step 9: Verify the committed Lane C branch from a clean archive**

```bash
TMP=$(mktemp -d)
git archive HEAD | tar -x -C "$TMP"
ln -s "$PWD/node_modules" "$TMP/node_modules"
(cd "$TMP" && npm test && npm run analyze && node test/package/package-smoke.mjs)
rm -rf "$TMP"
```

Expected: every command passes, and fresh archive tests no longer request a missing `dist/index.js`. Record pack contents, manifest paths, CI commands, clean-archive output, and commit SHA in the lane report.

### Task 4: Lane D — Deterministic visual and accessibility tests

**Files:**

- Modify: `.storybook/preview.ts`
- Modify: `stories/TimelineComponent.stories.ts`
- Modify: `stories/TimelineEvent.stories.ts`
- Modify: `test/visual/visual.spec.ts`
- Modify: `test/visual/accessibility.spec.ts`
- Modify: `playwright.config.ts`
- Create: `stories/assets/timeline-school.svg`
- Create: `stories/assets/timeline-team.svg`
- Create: `stories/assets/timeline-science.svg`
- Create: `stories/assets/timeline-design.svg`
- Create: `stories/assets/timeline-launch.svg`
- Create: `scripts/update-linux-snapshots.sh`
- Delete after regeneration: existing non-platform snapshot directories under `test/visual/__snapshots__/visual.spec.ts/{chromium,firefox,webkit}/`
- Create after regeneration: Darwin Chromium baselines under `test/visual/__snapshots__/visual.spec.ts/darwin/chromium/`
- Create after regeneration: Linux Chromium baselines under `test/visual/__snapshots__/visual.spec.ts/linux/chromium/`

**Interfaces:**

- Produces helper functions inside visual tests: `waitForTimelineReady(page)` and `waitForEventReady(locator)`.
- Produces Playwright projects where screenshot tests run only in Chromium while accessibility/behavior tests run in all three browsers.

- [ ] **Step 1: Add deterministic local story assets**

Create five simple SVG illustrations with fixed `viewBox="0 0 600 360"`, explicit dimensions, solid colors, and no external resources, fonts, animation, filters, randomness, or timestamps. Replace Pexels URLs with `/assets/timeline-school.svg`, `/assets/timeline-team.svg`, `/assets/timeline-science.svg`, `/assets/timeline-design.svg`, or `/assets/timeline-launch.svg` according to story subject.

Remove the Google Fonts `@import` from `.storybook/preview.ts` and use:

```css
body {
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Replace fixed sleeps with readiness helpers**

In visual/accessibility tests, implement readiness based on observable state:

```ts
async function waitForTimelineReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const timeline = document.querySelector('timeline-component');
    const events = [...document.querySelectorAll('timeline-event')];
    return (
      timeline?.shadowRoot?.querySelector('.timeline-container') &&
      events.every(
        (event) =>
          getComputedStyle(event).visibility === 'visible' &&
          (!event.shadowRoot?.querySelector('img') ||
            event.shadowRoot.querySelector('img')?.complete)
      )
    );
  });
  await page.evaluate(() => document.fonts.ready);
}
```

Use event-specific readiness for standalone stories. Remove every `waitForTimeout` used as a readiness mechanism; transition-state tests may wait on `transitionend` or disable animations through Playwright screenshot behavior.

- [ ] **Step 3: Re-enable contrast checks and tighten accessible-name assertions**

Remove `.disableRules(['color-contrast'])`. Assert each existing labelled timeline story has a non-empty computed accessible name, not merely an `aria-label` attribute. Keep this lane focused on infrastructure that passes against the baseline branch; cross-feature assertions for the new label fallback, date announcement, decorative placeholder, and `image-alt` behavior are added after Tasks 1 and 2 integrate.

- [ ] **Step 4: Configure deterministic screenshot scope**

Tag screenshot tests with `@visual` and accessibility/behavior tests with `@accessibility`. Configure Chromium, Firefox, and WebKit projects normally, but set Firefox/WebKit `grepInvert: /@visual/`. Keep Chromium running both tags. Add `{platform}` to `snapshotPathTemplate` so Darwin and Linux baselines cannot overwrite one another. CI uses `ubuntu-24.04` and package-lock-pinned Playwright browsers.

Delete obsolete Firefox/WebKit screenshot baselines after the configuration proves they are no longer selected.

- [ ] **Step 5: Stabilize existing responsive and standalone coverage**

Retain the existing desktop vertical, mobile, tablet, wide, and standalone screenshots. Keep the temporary inline standalone positioning workaround in this baseline lane because Lane B is not present yet. The integration task removes that workaround, asserts standalone visibility, adds the new one-sided geometry assertion, and updates behavior-driven baselines after Lanes A and B land.

- [ ] **Step 6: Run visual/accessibility tests and characterize RED**

Run:

```bash
npm run build-storybook
npm run test:visual
```

Expected before snapshot regeneration: baseline behavioral/accessibility assertions pass, while Chromium screenshots fail only because local assets, font stack, or snapshot paths intentionally changed. Any timeout, network request, missing image, contrast violation, or keyboard failure is a real defect and must be fixed before updating snapshots.

- [ ] **Step 7: Regenerate and re-run Chromium snapshots**

Generate Darwin Chromium baselines locally. Create `scripts/update-linux-snapshots.sh` with `set -euo pipefail`; it must run `mcr.microsoft.com/playwright:v1.57.0-noble` using `--platform=linux/amd64`, `--ipc=host`, and a writeable `/repo` bind mount. Inside the container, stream a tar copy into `/tmp/work` while excluding `.git`, `.worktrees`, `.superpowers`, `node_modules`, `dist`, `storybook-static`, `coverage`, `test-results`, and `playwright-report`; run `npm ci`, update Chromium `@visual` snapshots, then replace only `/repo/test/visual/__snapshots__/visual.spec.ts/linux/chromium` with the generated Linux Chromium directory.

Run:

```bash
npx playwright test --project=chromium --grep @visual --update-snapshots
bash scripts/update-linux-snapshots.sh
npm run test:visual
```

Expected: all selected tests pass; Darwin and Linux snapshots occupy separate platform directories; output contains no requests to Google Fonts or Pexels and no fixed-wait flakes across two consecutive `npm run test:visual` runs.

- [ ] **Step 8: Commit Lane D**

```bash
git add .storybook stories test/visual playwright.config.ts scripts/update-linux-snapshots.sh
git commit -m "test: make timeline visual coverage deterministic"
```

Record two consecutive passing runs, deleted obsolete snapshots, and commit SHA in the lane report.

### Task 5: Integration, review, and complete verification

**Files:**

- Modify: `stories/TimelineEvent.stories.ts` to remove temporary standalone positioning workarounds.
- Modify: `test/visual/accessibility.spec.ts` for cross-feature assertions.
- Modify: `test/visual/visual.spec.ts` for the one-sided mobile screenshot assertion.
- Update: platform-specific Chromium snapshots under `test/visual/__snapshots__/visual.spec.ts/{darwin,linux}/chromium/`.
- Potential production final-fix scope is restricted to the files explicitly owned by Tasks 1–4.
- Create the integration report only in the plan’s ignored SDD workspace.
- Do not modify the approved design; if implementation reveals a contradiction, record it as a blocked residual risk instead of silently changing product behavior.

**Interfaces:**

- Consumes all lane commits and reports.
- Produces one integrated branch with no unresolved audit findings.

- [ ] **Step 1: Review each lane before integration**

For each lane, compare its branch against the design baseline. Require:

- Spec-compliance verdict.
- Code-quality verdict.
- RED and GREEN command evidence.
- No edits outside lane ownership unless explicitly justified.
- Clean worktree and committed changes.

Return Critical/Important findings to the lane agent and re-review before integration.

- [ ] **Step 2: Integrate in contract order**

Cherry-pick or apply reviewed lane commits in this order:

1. Lane B event/date API.
2. Lane A layout/runtime.
3. Lane C package/CI/docs.
4. Lane D deterministic visual suite.

After each integration, run `git diff --check` and the lane’s focused tests. Resolve conflicts by preserving the approved design and the exact `isValidDate`/host-attribute contracts.

- [ ] **Step 3: Add integrated browser-level regression coverage**

Remove the temporary `position: relative; visibility: visible` inline styles from standalone `TimelineEvent` stories, then extend `test/visual/accessibility.spec.ts` to assert:

- A 375px vertical timeline places every event to the right of the axis, keeps all card rectangles non-negative, and has no horizontal overflow.
- A 600px vertical timeline retains events on both sides.
- A standalone event is visible and focusable without inline positioning workarounds.
- A list event exposes exactly one accessible date, the collection is a list, and event hosts are list items.
- A decorative placeholder is absent from the accessibility tree and a supplied `image-alt` is exposed.
- An omitted timeline label computes to `Timeline`.

Extend `test/visual/visual.spec.ts` with a tagged `@visual` 375px one-sided mobile screenshot. Run the new assertions before updating snapshots; geometry/semantics must already pass from Tasks 1 and 2, while the new screenshot is expected to fail because its baseline does not exist.

Regenerate both Darwin and Dockerized Linux Chromium snapshots after these assertions pass.

- [ ] **Step 4: Run static and unit validation**

Run:

```bash
npm run lint
npm run format:check
npm run build
npm test
npm run test:package
npm run build-storybook
```

Expected: every command exits 0; all unit tests pass in Chromium, Firefox, and WebKit without stale-dist behavior.

- [ ] **Step 5: Run visual/accessibility validation twice**

Run:

```bash
npm run test:visual
npm run test:visual
```

Expected: both runs pass with identical deterministic Chromium screenshots and cross-browser accessibility/behavior results.

- [ ] **Step 6: Verify clean archive and package contents**

Create a temporary archive from integrated `HEAD`, link dependencies, run `npm test`, build/analyze, and run the package smoke test. Inspect `custom-elements.json` module paths and `npm pack --dry-run --json`. Remove the temporary directory afterward.

Expected: no dependency on pre-existing ignored output; only public manifest modules; documented exports and license present.

- [ ] **Step 7: Run a fresh whole-branch review**

Dispatch independent reviewers for:

- Runtime correctness and responsive geometry.
- Accessibility/API compatibility.
- Tests, CI, package contents, and documentation.

Require exact file/line references and only concrete findings. Synthesize all accepted findings into one fix-worker pass, then run one scoped re-review.

- [ ] **Step 8: Final verification and completion commit**

Re-run every command from Steps 4–6 after final-review fixes. Confirm:

```bash
git status --short
git diff --check
git worktree list
```

Expected: no untracked worktree artifacts in the main checkout, no whitespace errors, and only intentional managed worktrees before cleanup.

Commit integration-only fixes with:

```bash
git add -A
git diff --cached --check
git commit -m "fix: integrate repository audit remediation"
```

Do not create an empty commit when no integration fixes were needed.

- [ ] **Step 9: Clean managed worktrees and hand off the branch**

Remove only worktrees created for this plan after their commits and reports are safely integrated. Preserve the main checkout and unrelated worktrees. Report final commits, commands, test counts, package contents, residual risks, and branch integration options.
