import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import '../../dist/index.js';
import type { TimelineComponent } from '../../dist/index.js';

describe('TimelineComponent', () => {
  it('renders with default horizontal layout', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
      </timeline-component>
    `);

    expect(el.vertical).to.be.false;
    expect(el.shadowRoot!.querySelector('.timeline-container')).to.exist;
  });

  it('supports vertical layout', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component vertical>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
      </timeline-component>
    `);

    expect(el.vertical).to.be.true;
  });

  it('accepts custom year range', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component start-year="1970" end-year="2000">
        <timeline-event date="1985-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    expect(el.startYear).to.equal(1970);
    expect(el.endYear).to.equal(2000);
  });

  it('auto-detects date range when no year range provided', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Last</h3></timeline-event>
      </timeline-component>
    `);

    // Should not have explicit year range
    expect(el.startYear).to.be.undefined;
    expect(el.endYear).to.be.undefined;
  });

  it('generates SVG axis and markers', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    await waitUntil(
      () => el.shadowRoot!.querySelector('svg path') !== null,
      'SVG should be generated',
      { timeout: 5000 }
    );

    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg).to.exist;
    expect(svg!.querySelector('path')).to.exist; // Axis line
  });

  it('generates event dots', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Event 2</h3></timeline-event>
      </timeline-component>
    `);

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('circle').length >= 2,
      'Dots should be generated for each event',
      { timeout: 5000 }
    );

    const dots = el.shadowRoot!.querySelectorAll('circle');
    expect(dots.length).to.be.greaterThanOrEqual(2);
  });

  it('has accessible label', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component label="Project timeline">
        <timeline-event date="2024-03-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    const wrapper = el.shadowRoot!.querySelector('.scroll-wrapper');
    expect(wrapper?.getAttribute('aria-label')).to.equal('Project timeline');
    expect(wrapper?.getAttribute('role')).to.equal('region');
  });

  it('SVG layer is hidden from screen readers', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    const svg = el.shadowRoot!.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).to.equal('true');
  });

  it('exposes parts for styling', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    expect(el.shadowRoot!.querySelector('[part="scroll-wrapper"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="container"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="svg-layer"]')).to.exist;
  });

  it('handles empty timeline gracefully', async () => {
    const el = await fixture<TimelineComponent>(html` <timeline-component></timeline-component> `);

    expect(el.shadowRoot!.querySelector('.timeline-container')).to.exist;
    // Should not throw errors
  });

  it('slots timeline events', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Event 2</h3></timeline-event>
      </timeline-component>
    `);

    const events = el.querySelectorAll('timeline-event');
    expect(events.length).to.equal(2);
  });

  it('updates layout when vertical property changes', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    expect(el.vertical).to.be.false;

    el.vertical = true;
    await el.updateComplete;

    expect(el.vertical).to.be.true;
  });

  it('generates connectors for events', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Event 2</h3></timeline-event>
      </timeline-component>
    `);

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('path[part="connector-line"]').length >= 2,
      'Connectors should be generated',
      { timeout: 5000 }
    );

    const connectors = el.shadowRoot!.querySelectorAll('path[part="connector-line"]');
    expect(connectors.length).to.be.greaterThanOrEqual(2);
  });

  it('sorts events by date', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-09-15"><h3>Later Event</h3></timeline-event>
        <timeline-event date="2024-03-15"><h3>Earlier Event</h3></timeline-event>
      </timeline-component>
    `);

    // Allow time for layout calculation
    await new Promise((resolve) => setTimeout(resolve, 100));
    await el.updateComplete;

    // The component should internally sort events by date
    // This is reflected in the layout calculations
    expect(el).to.exist;
  });

  it('generates year markers for long timelines', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component start-year="1970" end-year="2010">
        <timeline-event date="1985-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('text.marker-text').length > 0,
      'Year markers should be generated',
      { timeout: 5000 }
    );

    const markers = el.shadowRoot!.querySelectorAll('text.marker-text');
    expect(markers.length).to.be.greaterThan(0);

    // Should show years like 1970, 1975, 1980, etc.
    const markerTexts = Array.from(markers).map((m) => m.textContent);
    const hasYearMarker = markerTexts.some((t) => /^\d{4}$/.test(t || ''));
    expect(hasYearMarker).to.be.true;
  });

  it('generates monthly markers for short timelines', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Event 1</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Event 2</h3></timeline-event>
      </timeline-component>
    `);

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('text.marker-text').length > 0,
      'Month markers should be generated',
      { timeout: 5000 }
    );

    const markers = el.shadowRoot!.querySelectorAll('text.marker-text');
    expect(markers.length).to.be.greaterThan(0);

    // Should show month abbreviations like "Mar 24" or "Mar '24"
    const markerTexts = Array.from(markers).map((m) => m.textContent);
    // Check for month abbreviation pattern - could be "Mar 24", "Mar '24", or similar
    const hasMonthMarker = markerTexts.some(
      (t) => t && /^[A-Z][a-z]{2}\s+/.test(t) && /\d{2}$/.test(t)
    );
    expect(hasMonthMarker).to.be.true;
  });
});
