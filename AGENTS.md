# AGENTS.md - Repository Instructions for AI Agents

This document provides detailed instructions for AI agents working with the `lit-timeline` repository.

## Project Overview

`lit-timeline` is an npm package providing customizable timeline components built with [Lit](https://lit.dev/). It includes two web components:

- `<timeline-component>` - Main container that positions events on a horizontal, vertical, or list layout
- `<timeline-event>` - Individual event cards with optional images, displayed on the timeline

Pre-built CSS themes are included: dark, light, and modern.

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
│   ├── styles/                   # CSS-in-JS styles and theme files
│   │   ├── timeline-event.styles.ts
│   │   ├── timeline-component.styles.ts
│   │   ├── theme-dark.css        # Dark theme (purple with coral accents)
│   │   ├── theme-light.css       # Light theme (blue accents)
│   │   └── theme-modern.css      # Modern theme (glass-morphism, teal)
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
npm test                   # Build, then run unit tests in Chrome, Firefox, and Safari
npm run test:unit          # Run unit tests against already-built dist output
npm run test:watch         # Build once, then watch unit tests
npm run test:package       # Build, analyze, and smoke-test the packed package
npm run test:visual        # Run visual/accessibility Playwright tests
npm run test:visual:update # Update visual snapshots
```

Functional tests import from `dist/`. Use `npm test` for the fresh-checkout-safe build-and-test path; use `npm run test:unit` only when current output is already built.

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
- `list` (boolean) - Display as simple list without timeline axis
- `start-year` (number) - Override timeline start year
- `end-year` (number) - Override timeline end year
- `label` (string) - Accessible label for the timeline region; omitted or empty values render as `Timeline`

**CSS Custom Properties:**

- `--timeline-axis-color`, `--timeline-axis-width` - Main axis color and stroke width
- `--timeline-connector-color`, `--timeline-connector-width` - Connector color and stroke width
- `--timeline-dot-color`, `--timeline-dot-size` - Event dot color and radius
- `--timeline-marker-color`, `--timeline-marker-font-size` - Marker tick color and label size
- `--timeline-h-row-gap`, `--timeline-v-column-gap` - Axis-mode packing gaps
- `--timeline-list-gap`, `--timeline-list-padding` - List spacing and padding

### `<timeline-event>`

**Attributes:**

- `date` (string) - Canonical calendar date in strict YYYY-MM-DD format (required)
- `image-src` (string) - URL for event image (optional)
- `image-alt` (string) - Alternative text for meaningful images; defaults to empty for decorative images

**Slots:**

- Default slot - Event content (typically `<h3>` and `<p>` elements)

**CSS Custom Properties:**

- Card: `--timeline-event-width`, `--timeline-event-bg-color`, `--timeline-event-border-color`, `--timeline-event-border-radius`, `--timeline-event-shadow`
- Image/content: `--timeline-event-image-height`, `--timeline-event-content-padding`, `--timeline-event-content-min-height`
- Heading: `--timeline-event-heading-color`, `--timeline-event-heading-font-size`, `--timeline-event-heading-font-weight`
- Text: `--timeline-event-text-color`, `--timeline-event-text-font-size`
- Placeholder: `--timeline-event-placeholder-bg`, `--timeline-event-placeholder-color`
- Date/focus: `--timeline-event-date-color`, `--timeline-event-date-font-size`, `--timeline-event-date-font-weight`, `--timeline-event-focus-offset`
- List width: `--timeline-list-event-max-width`

**CSS Parts (for external styling):**

- `card` - Main card container
- `image` - Event image
- `image-placeholder` - Placeholder when no image
- `content` - Content area
- `date` - Date display (shown in list view)

## Architecture Notes

### Layout Algorithm

The `TimelineComponent` uses different layout algorithms based on mode:

**Horizontal/Vertical modes:**

1. Collects valid direct `<timeline-event>` children and their dimensions
2. Sorts and reorders valid direct children chronologically in the light DOM
3. Positions events to avoid overlap using a row/column packing algorithm
4. Generates SVG for axis, connectors, dots, and date markers
5. Uses observers to recalculate for child, date, content, mode, and container changes
6. Uses a one-sided vertical layout below 600px and alternating sides at 600px and wider

**List mode:**

1. Displays events in a simple vertical list using flexbox
2. Shows formatted date on each event card
3. No timeline axis or SVG decorations

### Date Handling

Dates are accepted only when they are canonical, real `YYYY-MM-DD` calendar dates and are parsed/formatted in UTC. Invalid or missing-date events set invalid state, are hidden and excluded from layout, and warn without throwing. Keep date validation centralized in `isValidDate` rather than relying on JavaScript's date normalization.

Standalone `<timeline-event>` elements remain relatively positioned, visible, and focusable. A parent `<timeline-component>` owns managed positioning, layout mode, chronological ordering, and roving tabindex. Images default to empty alternative text, `image-alt` supplies meaningful alternative text, and placeholders stay decorative.

### Styling Architecture

- Styles are defined in separate files (`src/styles/*.styles.ts`) using Lit's `css` tagged template
- Components use CSS custom properties for theming
- External styling is enabled via CSS `::part()` selectors
- Pre-built themes in `src/styles/theme-*.css` use wrapper class scoping:
  - `.timeline-dark-theme` - Dark theme
  - `.timeline-light-theme` - Light theme
  - `.timeline-modern-theme` - Modern glass-morphism theme
- Bundlers import themes through the package export, for example `@import 'lit-timeline/styles/theme-dark.css';`.
- A direct installed-package file link uses `node_modules/lit-timeline/src/styles/theme-dark.css`.

## Known Issues & Workarounds

### Decorator Transformation

Tests must import from `dist/` rather than `src/` because esbuild doesn't properly transform Lit decorators. `npm test` builds before running them; when invoking `npm run test:unit` directly, build first.

## Package Publishing

Before publishing:

1. Update version in `package.json`
2. Run `npm run ci`
3. Run `npm run build-storybook` to verify documentation
4. Run `npm publish`

The package exports:

- Main entry: `lit-timeline` → `dist/index.js`
- Individual components: `lit-timeline/timeline-event.js`, `lit-timeline/timeline-component.js`
- Theme CSS exports: `lit-timeline/styles/theme-dark.css`, `lit-timeline/styles/theme-light.css`, `lit-timeline/styles/theme-modern.css`
