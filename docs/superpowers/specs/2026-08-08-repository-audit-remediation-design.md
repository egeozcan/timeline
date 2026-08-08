# Repository Audit Remediation Design

## Goal

Resolve every actionable issue identified by the repository-wide audit while preserving compatibility where practical and documenting intentional minor behavior changes.

## Compatibility Policy

This work targets a minor release. Existing element names, primary attributes, CSS parts, and layout modes remain supported. Minor behavior improvements are allowed when they correct broken or inaccessible behavior, including standalone event visibility, strict date validation, chronological DOM ordering, and mobile vertical layout changes.

## Architecture

The work is divided into four isolated implementation lanes. Each lane runs in its own Git worktree, follows test-driven development, and produces reviewable commits. Lane interfaces are fixed before parallel implementation so changes can be integrated serially.

### Lane A: Timeline Layout and Runtime

Lane A owns `TimelineComponent`, its structural styles, and its behavioral tests.

Responsibilities:

- Discover only direct `<timeline-event>` children assigned to the default slot.
- Chronologically reorder valid direct children in the light DOM so visual, keyboard, list, and assistive-technology order agree.
- React to `slotchange`, child `date` mutations, child size changes, `startYear`, `endYear`, `vertical`, `list`, parent resize, and disconnect/reconnect.
- Coalesce invalidation so one logical mutation causes one layout pass.
- Preserve the currently focused event when refreshing roving tabindex.
- Use keyboard event composition rather than `document.activeElement`, allowing navigation inside nested shadow roots.
- Default an omitted/empty accessible label to `Timeline`, so the focusable region always has a non-empty name.
- Clear mode-owned dimensions before measuring another mode.
- Remove the frozen vertical width.
- Clear SVG, layouts, and dimensions for empty timelines.
- Keep cards inside scrollable non-negative bounds at explicit range boundaries.
- At viewport widths below 600px, render vertical timelines one-sided: axis on the left and all event cards on the right, without horizontal scrolling.
- Keep alternating left/right vertical layout at widths of 600px and above.

Lane A consumes the shared date-validation interface from Lane B:

```ts
isValidDate(dateString: string): boolean
```

Invalid events are excluded from ordering and layout, hidden, and handled through the warning behavior defined by Lane B.

### Lane B: Event, Date, and Accessibility API

Lane B owns `TimelineEvent`, date utilities, event styles, and their unit tests.

Responsibilities:

- Add strict canonical `YYYY-MM-DD` validation with calendar round-trip checks.
- Format calendar dates in UTC so the displayed day is stable in every time zone.
- Hide invalid or missing-date events and emit a deterministic console warning without throwing or breaking valid siblings.
- Make standalone `<timeline-event>` elements visible and relatively positioned by default.
- Move timeline-specific pre-layout positioning responsibility to the parent component.
- Keep standalone events focusable while allowing a parent timeline to manage roving tabindex.
- React when slotted heading text changes so accessible names and generated text remain current.
- Add an `image-alt` attribute/property. Empty alternative text is the default for decorative images. Placeholder artwork is hidden from assistive technology.
- Use one `<time>` element for each date, visually hidden in axis modes and visible in list mode, preventing duplicate announcements.
- Support list-item semantics when the parent enables list mode.
- Either wire every documented CSS custom property into component styles or remove false documentation. Existing useful properties remain supported.

### Lane C: Packaging, CI, Metadata, and Documentation

Lane C owns package scripts/exports, workflows, Custom Elements Manifest configuration, licensing, documentation, and package smoke tests.

Responsibilities:

- Add pull-request and push CI that runs lint, formatting, build, and cross-browser unit tests.
- Make `npm test` safe on a fresh checkout and unable to test stale `dist` output, using a build prerequisite while preserving watch-mode ergonomics.
- Make release publishing depend on the same non-visual validation.
- Configure Custom Elements Manifest analysis to inspect only public source components and emit paths that correspond to published package modules.
- Correct theme documentation to use exported paths such as `lit-timeline/styles/theme-dark.css`.
- Add a packed-package smoke test that verifies root/component/theme exports and manifest contents.
- Add the canonical MIT license text.
- Document intentional minor behavior changes and new accessibility/date behavior.
- Ignore `.worktrees/` and `.superpowers/` so local and agent workspaces cannot be committed accidentally.

### Lane D: Deterministic Visual and Accessibility Testing

Lane D owns Storybook assets/configuration and Playwright visual/accessibility tests.

Responsibilities:

- Replace remote Google fonts and Pexels images used by tested stories with repository-local deterministic assets.
- Replace fixed sleeps with readiness assertions for custom-element definition, layout completion, images, and fonts.
- Run screenshot regression tests in Chromium only, using Playwright's lockfile-pinned browser on `ubuntu-24.04`; retain behavioral and accessibility coverage in Chromium, Firefox, and WebKit.
- Remove blanket color-contrast suppression. Any unavoidable exclusion must target only the exact non-user-visible node.
- Add coverage for one-sided mobile vertical layout and standalone event presentation.
- Regenerate snapshots only after all integrated behavior is stable.

## Event and Layout Data Flow

1. The slot reports assigned direct elements.
2. Each candidate date is validated with `isValidDate`.
3. Invalid events are hidden and warned about; they do not enter range or SVG calculations.
4. Valid events are sorted chronologically and reordered in the light DOM under a reentrancy guard.
5. Roving tabindex is refreshed while preserving the focused event when possible.
6. The selected layout algorithm clears stale dimensions, measures cards, computes a valid range, and places cards inside non-negative scrollable bounds.
7. SVG axis, markers, connectors, and dots are derived from the same ordered collection.
8. Resize, mutation, and property observers schedule a coalesced recalculation.

## Error Handling

- Invalid dates never throw from lifecycle callbacks.
- Each invalid element produces a deterministic warning that identifies the invalid value.
- An all-invalid or empty timeline renders without SVG decorations or oversized scrolling regions.
- Reversed explicit ranges are treated as invalid configuration: layout remains empty and a deterministic warning is emitted.
- External image failures do not block layout readiness or visual tests because test stories use local assets.

## Testing Strategy

Every production behavior change follows red-green-refactor. Each agent must record the failing test command and expected failure before implementation.

Required behavioral coverage includes:

- Dynamic append, removal, date mutation, and content/size mutation.
- Nested timelines and nested-shadow-root keyboard navigation.
- Chronological DOM, list, keyboard, and layout order.
- Start-only, end-only, runtime range changes, and reversed ranges.
- Empty/all-invalid/mixed-valid-invalid timelines.
- 320px and 375px one-sided vertical layout with non-negative card bounds.
- Desktop alternating vertical layout and parent resize in both directions.
- Horizontal/vertical/list transition equivalence to fresh destination-mode components.
- Disconnect/reconnect followed by resize.
- UTC-12, UTC, and UTC+14 date stability.
- Standalone event visibility/focus, reactive titles, image alternatives, and single date announcement.
- Fresh-checkout `npm test`, clean CEM generation, packed-package export resolution, CI configuration, deterministic visual snapshots, and enabled contrast checks.

## Parallel Integration Strategy

Lanes B, C, and D branch from the committed design/setup baseline and start concurrently. Lane B lands the shared date-validation contract first. Lane A then branches from Lane B’s reviewed commit while Lane C and Lane D continue in parallel. This preserves compile-time verification without duplicating the shared validator. Lanes C and D remain source-disjoint from A/B except for documentation and snapshots.

Integration order:

1. Lane B: event/date API.
2. Lane A: layout/runtime.
3. Lane C: packaging/CI/docs.
4. Lane D: deterministic visual suite and regenerated snapshots.

Each lane receives an independent review before integration. After integration, one fresh reviewer audits the complete branch, one fix agent handles accepted cross-lane findings, and all validation gates run again.

## Completion Criteria

- All audit findings are fixed or explicitly documented with a technical reason for deferral.
- Lint, format checking, TypeScript build, and cross-browser unit tests pass.
- Storybook production build passes.
- Accessibility and visual tests pass deterministically.
- `npm test` passes from a fresh archive without pre-existing `dist`.
- The generated Custom Elements Manifest contains only published public modules.
- A dry-run package contains and resolves all documented exports and includes the MIT license.
- No tracked or untracked worktree artifacts remain in the main checkout.
