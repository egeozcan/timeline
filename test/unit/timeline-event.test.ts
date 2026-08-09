import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/index.js';
import type { TimelineEvent } from '../../dist/index.js';

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe('TimelineEvent', () => {
  it('renders with date and content', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test Event</h3>
        <p>Test description</p>
      </timeline-event>
    `);

    expect(el.date).to.equal('2024-03-15');
    expect(el.shadowRoot!.querySelector('.card')).to.exist;
  });

  it('displays image when imageSrc is provided', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15" image-src="https://example.com/test.jpg">
        <h3>Test</h3>
      </timeline-event>
    `);

    const img = el.shadowRoot!.querySelector('img');
    expect(img).to.exist;
    expect(img?.getAttribute('src')).to.equal('https://example.com/test.jpg');
  });

  it('displays placeholder when no image', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    const placeholder = el.shadowRoot!.querySelector('.image-placeholder');
    expect(placeholder).to.exist;
    expect(placeholder?.textContent).to.contain('2024-03-15');
  });

  it('is visible and keyboard focusable when standalone', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15"><h3>Standalone</h3></timeline-event>
    `);

    expect(getComputedStyle(el).visibility).to.equal('visible');
    expect(getComputedStyle(el).position).to.equal('relative');
    expect(el.tabIndex).to.equal(0);
  });

  it('follows the managed, ready, and list visibility contract', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15"><h3>Managed</h3></timeline-event>
    `);

    el.setAttribute('data-timeline-managed', '');
    expect(getComputedStyle(el).position).to.equal('absolute');
    expect(getComputedStyle(el).visibility).to.equal('hidden');

    el.setAttribute('data-layout-ready', '');
    expect(getComputedStyle(el).visibility).to.equal('visible');

    el.removeAttribute('data-layout-ready');
    expect(getComputedStyle(el).visibility).to.equal('hidden');

    el.setAttribute('data-layout-mode', 'list');
    expect(getComputedStyle(el).visibility).to.equal('visible');
  });

  it('wires documented host, card, and placeholder CSS variables', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15"><h3>Styled</h3></timeline-event>
    `);
    el.style.cssText = `
      --timeline-event-width: 321px;
      --timeline-event-focus-offset: 7px;
      --timeline-event-bg-color: rgb(1, 2, 3);
      --timeline-event-border-color: rgb(4, 5, 6);
      --timeline-event-border-radius: 23px;
      --timeline-event-shadow: rgb(7, 8, 9) 1px 2px 3px 4px;
      --timeline-event-image-height: 151px;
      --timeline-event-placeholder-bg: rgb(10, 11, 12);
      --timeline-event-placeholder-color: rgb(13, 14, 15);
    `;

    const hostStyle = getComputedStyle(el);
    const cardStyle = getComputedStyle(el.shadowRoot!.querySelector('.card')!);
    const placeholderStyle = getComputedStyle(el.shadowRoot!.querySelector('.image-placeholder')!);

    expect(hostStyle.width).to.equal('321px');
    expect(hostStyle.outlineOffset).to.equal('7px');
    expect(cardStyle.backgroundColor).to.equal('rgb(1, 2, 3)');
    expect(cardStyle.borderTopColor).to.equal('rgb(4, 5, 6)');
    expect(cardStyle.borderTopLeftRadius).to.equal('23px');
    expect(cardStyle.boxShadow).to.equal('rgb(7, 8, 9) 1px 2px 3px 4px');
    expect(placeholderStyle.height).to.equal('151px');
    expect(placeholderStyle.backgroundColor).to.equal('rgb(10, 11, 12)');
    expect(placeholderStyle.color).to.equal('rgb(13, 14, 15)');
  });

  it('wires documented content, typography, date, and list CSS variables', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Styled heading</h3>
        <p>Styled text</p>
      </timeline-event>
    `);
    el.style.cssText = `
      --timeline-event-content-padding: 21px;
      --timeline-event-content-min-height: 131px;
      --timeline-event-heading-color: rgb(16, 17, 18);
      --timeline-event-heading-font-size: 19px;
      --timeline-event-heading-font-weight: 600;
      --timeline-event-text-color: rgb(19, 20, 21);
      --timeline-event-text-font-size: 17px;
      --timeline-event-date-color: rgb(22, 23, 24);
      --timeline-event-date-font-size: 13px;
      --timeline-event-date-font-weight: 400;
      --timeline-list-event-max-width: 555px;
    `;
    el.setAttribute('data-layout-mode', 'list');

    const contentStyle = getComputedStyle(el.shadowRoot!.querySelector('.content')!);
    const headingStyle = getComputedStyle(el.querySelector('h3')!);
    const textStyle = getComputedStyle(el.querySelector('p')!);
    const dateStyle = getComputedStyle(el.shadowRoot!.querySelector('time')!);

    expect(contentStyle.paddingTop).to.equal('21px');
    expect(contentStyle.minHeight).to.equal('131px');
    expect(headingStyle.color).to.equal('rgb(16, 17, 18)');
    expect(headingStyle.fontSize).to.equal('19px');
    expect(headingStyle.fontWeight).to.equal('600');
    expect(textStyle.color).to.equal('rgb(19, 20, 21)');
    expect(textStyle.fontSize).to.equal('17px');
    expect(dateStyle.color).to.equal('rgb(22, 23, 24)');
    expect(dateStyle.fontSize).to.equal('13px');
    expect(dateStyle.fontWeight).to.equal('400');
    expect(getComputedStyle(el).maxWidth).to.equal('555px');
  });

  it('has proper ARIA attributes', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>My Event Title</h3>
      </timeline-event>
    `);

    // Role and name live on the host, which is the focus target.
    const internals = (el as unknown as { _internals: ElementInternals })._internals;
    expect(internals.role).to.equal('article');
    expect(internals.ariaLabel).to.include('My Event Title');
    expect(el.shadowRoot!.querySelector('.card')?.hasAttribute('role')).to.be.false;
  });

  it('renders one visually hidden date that becomes visible in list mode', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    const dates = el.shadowRoot!.querySelectorAll('time');
    expect(dates).to.have.length(1);
    expect(dates[0].textContent).to.contain('March 15, 2024');
    expect(getComputedStyle(dates[0]).position).to.equal('absolute');

    el.setAttribute('data-layout-mode', 'list');
    expect(getComputedStyle(dates[0]).position).to.equal('static');
  });

  it('uses fallback title when no h3 is present', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <p>Just a description</p>
      </timeline-event>
    `);

    const internals = (el as unknown as { _internals: ElementInternals })._internals;
    expect(internals.ariaLabel).to.contain('Event on March 15, 2024');
  });

  it('exposes parts for styling', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15" image-src="test.jpg">
        <h3>Test</h3>
      </timeline-event>
    `);

    expect(el.shadowRoot!.querySelector('[part="card"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="image"]')).to.exist;
    expect(el.shadowRoot!.querySelector('[part="content"]')).to.exist;
  });

  it('exposes placeholder part when no image', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    expect(el.shadowRoot!.querySelector('[part="image-placeholder"]')).to.exist;
  });

  it('slots content correctly', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Slotted Title</h3>
        <p>Slotted description</p>
      </timeline-event>
    `);

    const h3 = el.querySelector('h3');
    const p = el.querySelector('p');

    expect(h3?.textContent).to.equal('Slotted Title');
    expect(p?.textContent).to.equal('Slotted description');
  });

  it('reflects date property changes and updates rendered content', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    el.date = '2025-06-20';
    await el.updateComplete;

    const date = el.shadowRoot!.querySelector('time');
    expect(el.getAttribute('date')).to.equal('2025-06-20');
    expect(date?.textContent).to.contain('June 20, 2025');
  });

  it('updates when imageSrc property changes', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    expect(el.shadowRoot!.querySelector('.image-placeholder')).to.exist;
    expect(el.shadowRoot!.querySelector('img')).to.not.exist;

    el.imageSrc = 'https://example.com/new-image.jpg';
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.image-placeholder')).to.not.exist;
    expect(el.shadowRoot!.querySelector('img')).to.exist;
  });

  it('uses consumer-provided image alternative text', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15" image-src="test.jpg" image-alt="Team at launch">
        <h3>Launch</h3>
      </timeline-event>
    `);

    expect(el.shadowRoot!.querySelector('img')!.getAttribute('alt')).to.equal('Team at launch');
  });

  it('reflects imageAlt between its property and image-alt attribute', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15"><h3>Launch</h3></timeline-event>
    `);

    expect(el.imageAlt).to.equal('');
    expect(el.getAttribute('image-alt')).to.equal('');

    el.imageAlt = 'Set through property';
    await el.updateComplete;
    expect(el.getAttribute('image-alt')).to.equal('Set through property');

    el.setAttribute('image-alt', 'Set through attribute');
    await el.updateComplete;
    expect(el.imageAlt).to.equal('Set through attribute');
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
    expect(placeholder.shadowRoot!.querySelector('.image-placeholder')!.hasAttribute('role')).to.be
      .false;
  });

  it('updates its accessible name when slotted heading text changes', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15"><h3>Before</h3></timeline-event>
    `);

    el.querySelector('h3')!.textContent = 'After';
    await nextFrame();

    const internals = (el as unknown as { _internals: ElementInternals })._internals;
    expect(internals.ariaLabel).to.equal('After');
  });

  it('marks a missing date invalid, warns, and recovers when assigned a valid date', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    try {
      console.warn = (message?: unknown) => warnings.push(String(message));
      const el = await fixture<TimelineEvent>(html`
        <timeline-event><h3>Missing date</h3></timeline-event>
      `);

      expect(el.hasAttribute('data-invalid-date')).to.be.true;
      expect(getComputedStyle(el).display).to.equal('none');
      expect(warnings).to.deep.equal(['[timeline-event] Invalid date ""; expected YYYY-MM-DD.']);

      el.date = '2024-02-29';
      await el.updateComplete;
      expect(el.hasAttribute('data-invalid-date')).to.be.false;
      expect(getComputedStyle(el).display).to.equal('block');
    } finally {
      // eslint-disable-next-line require-atomic-updates
      console.warn = originalWarn;
    }
  });

  it('warns once for each distinct invalid date value', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    try {
      console.warn = (message?: unknown) => warnings.push(String(message));
      const el = await fixture<TimelineEvent>(html`
        <timeline-event date="2024-02-29"><h3>Invalid dates</h3></timeline-event>
      `);

      el.date = '2024-02-30';
      await el.updateComplete;
      el.date = '2024-02-29';
      await el.updateComplete;
      el.date = '2024-02-30';
      await el.updateComplete;
      el.date = '2023-02-29';
      await el.updateComplete;

      expect(warnings).to.deep.equal([
        '[timeline-event] Invalid date "2024-02-30"; expected YYYY-MM-DD.',
        '[timeline-event] Invalid date "2023-02-29"; expected YYYY-MM-DD.',
      ]);
    } finally {
      // eslint-disable-next-line require-atomic-updates
      console.warn = originalWarn;
    }
  });
});
