# lit-timeline

A customizable timeline component built with [Lit](https://lit.dev/) for displaying chronological events in horizontal or vertical layouts.

## Features

- **Horizontal and vertical layouts** - Display timelines in either orientation
- **Auto date range detection** - Automatically determines timeline bounds from events
- **CSS custom properties** - Fully customizable appearance through theming
- **Responsive design** - Scrollable container adapts to different screen sizes
- **Accessible** - ARIA labels, keyboard navigation, and screen reader support
- **Lightweight** - Built on Lit with minimal dependencies

## Installation

```bash
npm install lit-timeline
```

**Peer dependency**: This package requires `lit` ^3.0.0 as a peer dependency.

```bash
npm install lit
```

## Quick Start

```html
<script type="module">
  import 'lit-timeline';
</script>

<timeline-component label="Project milestones">
  <timeline-event date="2024-03-15">
    <h3>Project Kick-off</h3>
    <p>Initial planning phase begins.</p>
  </timeline-event>

  <timeline-event date="2024-06-01" image-src="launch.jpg">
    <h3>Product Launch</h3>
    <p>Official release to the public.</p>
  </timeline-event>
</timeline-component>
```

## Components

### `<timeline-component>`

The main container that positions events on a timeline axis.

#### Attributes

| Attribute    | Type    | Default | Description                                         |
| ------------ | ------- | ------- | --------------------------------------------------- |
| `vertical`   | boolean | `false` | Display timeline vertically instead of horizontally |
| `start-year` | number  | auto    | Override start year for timeline range              |
| `end-year`   | number  | auto    | Override end year for timeline range                |
| `label`      | string  | `""`    | Accessible label for the timeline region            |

#### Examples

**Horizontal timeline (default):**

```html
<timeline-component label="Company history">
  <timeline-event date="2020-01-15">...</timeline-event>
  <timeline-event date="2022-06-30">...</timeline-event>
</timeline-component>
```

**Vertical timeline:**

```html
<timeline-component vertical label="Project phases">
  <timeline-event date="2024-01-01">...</timeline-event>
  <timeline-event date="2024-03-15">...</timeline-event>
</timeline-component>
```

**Fixed year range:**

```html
<timeline-component start-year="1990" end-year="2020" label="Career timeline">
  <timeline-event date="1995-06-15">...</timeline-event>
  <timeline-event date="2010-09-01">...</timeline-event>
</timeline-component>
```

### `<timeline-event>`

Individual event cards displayed on the timeline.

#### Attributes

| Attribute   | Type   | Default  | Description                       |
| ----------- | ------ | -------- | --------------------------------- |
| `date`      | string | required | Event date in `YYYY-MM-DD` format |
| `image-src` | string | `""`     | URL for the event header image    |

#### Slots

| Slot    | Description                                                  |
| ------- | ------------------------------------------------------------ |
| default | Event content (typically `<h3>` title and `<p>` description) |

#### Examples

**With image:**

```html
<timeline-event date="2024-03-15" image-src="photo.jpg">
  <h3>Conference Talk</h3>
  <p>Presented at the annual tech conference.</p>
</timeline-event>
```

**Without image:**

```html
<timeline-event date="2024-03-15">
  <h3>Team Meeting</h3>
  <p>Quarterly planning session with the team.</p>
</timeline-event>
```

## Styling

### CSS Custom Properties

Customize the appearance using CSS custom properties:

```css
timeline-component {
  /* Timeline axis */
  --timeline-axis-color: #47476b;
  --timeline-axis-width: 2;

  /* Event connectors */
  --timeline-connector-color: #47476b;
  --timeline-connector-width: 2;

  /* Event dots */
  --timeline-dot-color: #ff6b6b;
  --timeline-dot-size: 5;

  /* Date markers */
  --timeline-marker-color: #a4a4c1;
  --timeline-marker-text-color: #a4a4c1;
  --timeline-marker-font-size: 0.9rem;

  /* Layout spacing */
  --timeline-h-row-gap: 330px; /* Horizontal mode row gap */
  --timeline-v-column-gap: 100px; /* Vertical mode column gap */

  /* Scrollbar */
  --timeline-scrollbar-thumb-color: #47476b;
  --timeline-scrollbar-track-color: transparent;
}

timeline-event {
  /* Card appearance */
  --timeline-event-width: 250px;
  --timeline-event-bg-color: #2c2c54;
  --timeline-event-border-color: #47476b;
  --timeline-event-border-radius: 16px;
  --timeline-event-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  /* Image */
  --timeline-event-image-height: 140px;
  --timeline-event-placeholder-bg: #3a3a66;
  --timeline-event-placeholder-color: #8c8caf;

  /* Content */
  --timeline-event-content-padding: 20px;
  --timeline-event-content-min-height: 125px;

  /* Typography */
  --timeline-event-heading-color: #ffffff;
  --timeline-event-heading-font-size: 1.1rem;
  --timeline-event-heading-font-weight: 700;
  --timeline-event-text-color: #a4a4c1;
  --timeline-event-text-font-size: 0.9rem;

  /* Focus state */
  --timeline-event-focus-offset: 4px;
}
```

### CSS Parts

For more advanced styling, use CSS `::part()` selectors:

**Timeline Component Parts:**

```css
timeline-component::part(scroll-wrapper) {
  /* Scrollable container */
}
timeline-component::part(container) {
  /* Main container */
}
timeline-component::part(svg-layer) {
  /* SVG overlay */
}
timeline-component::part(axis-line) {
  /* Timeline axis */
}
timeline-component::part(connector-line) {
  /* Event connectors */
}
timeline-component::part(marker-tick) {
  /* Date marker ticks */
}
timeline-component::part(marker-text) {
  /* Date marker labels */
}
timeline-component::part(dot) {
  /* Event dots */
}
```

**Timeline Event Parts:**

```css
timeline-event::part(card) {
  /* Card container */
}
timeline-event::part(image) {
  /* Event image */
}
timeline-event::part(image-placeholder) {
  /* Placeholder when no image */
}
timeline-event::part(content) {
  /* Content area */
}
```

### Theming Example

```css
/* Dark purple theme */
.purple-theme {
  --timeline-axis-color: #6b46c1;
  --timeline-dot-color: #9f7aea;
  --timeline-connector-color: #553c9a;
  --timeline-event-bg-color: #2d3748;
  --timeline-event-border-color: #6b46c1;
  --timeline-event-heading-color: #e9d8fd;
}

/* Grayscale images that colorize on hover */
.grayscale-hover timeline-event::part(image) {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.grayscale-hover timeline-event:hover::part(image) {
  filter: grayscale(0%);
}
```

## Date Range Behavior

The timeline automatically determines its date range:

- **Short timelines** (< 2 years): Shows monthly markers (e.g., "Mar 24", "Apr 24")
- **Long timelines** (≥ 2 years): Shows 5-year markers (e.g., "1990", "1995", "2000")

Override this with `start-year` and `end-year` attributes for explicit control.

## Accessibility

The timeline component is designed with accessibility in mind, following WCAG 2.1 AA guidelines.

### ARIA Support

- Timeline region has `role="region"` with configurable `aria-label`
- Event cards have `role="article"` with descriptive labels
- Screen reader-only date announcements for each event
- SVG decorations are hidden from assistive technology (`aria-hidden="true"`)

### Keyboard Navigation

The timeline uses the **roving tabindex** pattern for efficient keyboard navigation:

| Key           | Action                                     |
| ------------- | ------------------------------------------ |
| `Tab`         | Move focus into/out of the timeline        |
| `Arrow Right` | Move to next event (horizontal layout)     |
| `Arrow Left`  | Move to previous event (horizontal layout) |
| `Arrow Down`  | Move to next event (vertical layout)       |
| `Arrow Up`    | Move to previous event (vertical layout)   |
| `Home`        | Move to first event                        |
| `End`         | Move to last event                         |

**How it works:**

1. Press `Tab` to focus the timeline, then `Tab` again to focus the first event
2. Use arrow keys to navigate between events (direction depends on layout orientation)
3. Press `Tab` to exit the timeline and continue to the next focusable element

```html
<!-- Horizontal: use Left/Right arrows -->
<timeline-component label="History">
  <timeline-event date="2024-01-01">...</timeline-event>
  <timeline-event date="2024-06-01">...</timeline-event>
</timeline-component>

<!-- Vertical: use Up/Down arrows -->
<timeline-component vertical label="Process">
  <timeline-event date="2024-01-01">...</timeline-event>
  <timeline-event date="2024-06-01">...</timeline-event>
</timeline-component>
```

### Focus Management

- Only one event is in the tab order at a time (roving tabindex)
- Focus automatically scrolls events into view
- Visible focus indicator with customizable offset (`--timeline-event-focus-offset`)

## Browser Support

Supports all modern browsers:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## TypeScript

Full TypeScript support with exported types:

```typescript
import { TimelineComponent, TimelineEvent } from 'lit-timeline';
import type { TimelineEventData, EventLayout, SVGData } from 'lit-timeline';

// Type-safe element selection
const timeline = document.querySelector('timeline-component')!;
timeline.vertical = true;

const event = document.querySelector('timeline-event')!;
console.log(event.date); // string
```

## License

MIT
