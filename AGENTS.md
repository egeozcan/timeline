# AGENTS.md - Repository Instructions for AI Agents

This document provides detailed instructions for AI agents working with the `lit-timeline` repository.

## Project Overview

`lit-timeline` is an npm package providing customizable timeline components built with [Lit](https://lit.dev/). It includes two web components:

- `<timeline-component>` - Main container that positions events on a horizontal or vertical timeline axis
- `<timeline-event>` - Individual event cards with optional images, displayed on the timeline

## Technology Stack

- **Language**: TypeScript
- **Framework**: Lit 3.x (Web Components)
- **Build**: TypeScript compiler (tsc)
- **Testing**: Web Test Runner with Playwright browsers
- **Visual Testing**: Playwright screenshot comparisons
- **Documentation**: Storybook 8.x

## Project Structure

```
lit-timeline/
├── src/                          # Source code
│   ├── components/               # Lit components
│   │   ├── timeline-event.ts     # Event card component
│   │   ├── timeline-component.ts # Main timeline container
│   │   └── index.ts              # Component exports
│   ├── styles/                   # CSS-in-JS styles (Lit css tagged templates)
│   │   ├── timeline-event.styles.ts
│   │   └── timeline-component.styles.ts
│   ├── types/                    # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   └── date-utils.ts         # Date formatting/parsing
│   └── index.ts                  # Main package entry point
├── stories/                      # Storybook stories
│   ├── Introduction.mdx          # Documentation page
│   ├── TimelineEvent.stories.ts
│   └── TimelineComponent.stories.ts
├── test/                         # Tests
│   ├── unit/                     # Functional tests (Web Test Runner)
│   │   ├── date-utils.test.ts
│   │   ├── timeline-event.test.ts
│   │   └── timeline-component.test.ts
│   └── visual/                   # Visual regression tests (Playwright)
│       ├── visual.spec.ts
│       └── __snapshots__/        # Screenshot baselines (generated)
├── dist/                         # Build output (gitignored)
├── .storybook/                   # Storybook configuration
│   ├── main.ts
│   └── preview.ts
├── package.json
├── tsconfig.json                 # TypeScript config (development)
├── tsconfig.build.json           # TypeScript config (production build)
├── vite.config.ts                # Vite config (for Storybook)
├── web-test-runner.config.mjs    # Web Test Runner config
├── playwright.config.ts          # Playwright config
└── timeline.html                 # Original demo file (reference only)
```

## Commands

### Build

```bash
npm run build              # Compile TypeScript to dist/
npm run build:watch        # Watch mode for development
```

Build output goes to `dist/` with `.js` and `.d.ts` files.

### Testing

```bash
npm test                   # Run all functional tests (Chrome, Firefox, Safari)
npm run test:watch         # Watch mode for tests
npm run test:visual        # Run visual regression tests
npm run test:visual:update # Update visual snapshots
```

**Important**: Functional tests import from `dist/`, so run `npm run build` before `npm test` if you've made source changes.

### Storybook

```bash
npm run storybook          # Start dev server on http://localhost:6006
npm run build-storybook    # Build static Storybook to storybook-static/
```

### Linting & Formatting

```bash
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix lint issues
npm run format             # Format with Prettier
npm run format:check       # Check formatting (CI)
```

### Pre-commit Hooks

This repository uses **Husky** and **lint-staged** to enforce code quality on every commit:

- **TypeScript files** (`*.ts`): ESLint fix + Prettier format
- **JSON/Markdown files** (`*.json`, `*.md`, `*.mdx`): Prettier format

Pre-commit hooks run automatically. If a commit fails:

1. Fix the reported issues
2. Stage the fixes with `git add`
3. Retry the commit

To skip hooks in emergencies (not recommended):

```bash
git commit --no-verify -m "message"
```

## Development Workflow

### Making Changes to Components

1. Edit files in `src/components/` or `src/styles/`
2. Run `npm run build` to compile
3. Run `npm test` to verify tests pass
4. Run `npm run storybook` to visually verify changes

### Adding New Features

1. Update the component TypeScript file
2. Update styles if needed in `src/styles/`
3. Add/update tests in `test/unit/`
4. Add/update Storybook stories in `stories/`
5. Update visual snapshots if appearance changed: `npm run test:visual:update`

### Writing Tests

Tests use `@open-wc/testing` with Mocha/Chai. Example pattern:

```typescript
import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/index.js';
import type { TimelineEvent } from '../../dist/index.js';

describe('TimelineEvent', () => {
  it('renders with date', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test Event</h3>
      </timeline-event>
    `);
    expect(el.date).to.equal('2024-03-15');
  });
});
```

**Note**: Import from `dist/` not `src/` to avoid decorator transformation issues.

### Writing Stories

Stories use Storybook's CSF3 format:

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js'; // Stories can import from src/

const meta: Meta = {
  title: 'Components/TimelineEvent',
  tags: ['autodocs'],
};
export default meta;

export const WithImage: StoryObj = {
  render: () => html`
    <timeline-event date="2024-03-15" image-src="example.jpg">
      <h3>Event Title</h3>
      <p>Event description</p>
    </timeline-event>
  `,
};
```

## Component API

### `<timeline-component>`

**Attributes:**

- `vertical` (boolean) - Display vertically instead of horizontally
- `start-year` (number) - Override timeline start year
- `end-year` (number) - Override timeline end year
- `label` (string) - Accessible label for the timeline region

**CSS Custom Properties:**

- `--timeline-axis-color` - Main axis line color
- `--timeline-dot-color` - Event dot color
- `--timeline-connector-color` - Connector line color
- `--timeline-marker-text-color` - Date marker text color
- `--timeline-h-row-gap` - Row gap in horizontal mode
- `--timeline-v-column-gap` - Column gap in vertical mode

### `<timeline-event>`

**Attributes:**

- `date` (string) - Event date in YYYY-MM-DD format (required)
- `image-src` (string) - URL for event image (optional)

**Slots:**

- Default slot - Event content (typically `<h3>` and `<p>` elements)

**CSS Custom Properties:**

- `--timeline-event-width` - Card width
- `--timeline-event-bg-color` - Card background
- `--timeline-event-border-color` - Card border color
- `--timeline-event-heading-color` - Title text color
- `--timeline-event-text-color` - Description text color

**CSS Parts (for external styling):**

- `card` - Main card container
- `image` - Event image
- `image-placeholder` - Placeholder when no image
- `content` - Content area

## Architecture Notes

### Layout Algorithm

The `TimelineComponent` uses a layout algorithm that:

1. Collects all `<timeline-event>` children and their dimensions
2. Sorts events by date
3. Positions events to avoid overlap using a row/column packing algorithm
4. Generates SVG for axis, connectors, dots, and date markers
5. Uses ResizeObserver to recalculate on container resize

### Date Handling

All dates use the `T12:00:00Z` suffix when parsing to avoid timezone issues:

```typescript
const date = new Date(dateString + 'T12:00:00Z');
```

### Styling Architecture

- Styles are defined in separate files (`src/styles/*.styles.ts`) using Lit's `css` tagged template
- Components use CSS custom properties for theming
- External styling is enabled via CSS `::part()` selectors

## Known Issues & Workarounds

### ResizeObserver Loop Errors in Tests

The test runner configuration suppresses ResizeObserver loop errors which are expected when testing components that use ResizeObserver. This is handled in `web-test-runner.config.mjs`.

### Decorator Transformation

Tests must import from `dist/` rather than `src/` because esbuild doesn't properly transform Lit decorators. Always build before testing.

## Package Publishing

Before publishing:

1. Update version in `package.json`
2. Run `npm run build`
3. Run `npm test` to ensure all tests pass
4. Run `npm run build-storybook` to verify documentation
5. Run `npm publish`

The package exports:

- Main entry: `lit-timeline` → `dist/index.js`
- Individual components: `lit-timeline/timeline-event.js`, `lit-timeline/timeline-component.js`
