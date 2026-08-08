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

  it('has proper ARIA attributes', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>My Event Title</h3>
      </timeline-event>
    `);

    const card = el.shadowRoot!.querySelector('.card');
    expect(card?.getAttribute('role')).to.equal('article');
    expect(card?.getAttribute('aria-label')).to.include('My Event Title');
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

    const card = el.shadowRoot!.querySelector('.card');
    expect(card?.getAttribute('aria-label')).to.contain('Event on March 15, 2024');
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

  it('updates when date property changes', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    el.date = '2025-06-20';
    await el.updateComplete;

    const date = el.shadowRoot!.querySelector('time');
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

    expect(el.shadowRoot!.querySelector('[role="article"]')!.getAttribute('aria-label')).to.equal(
      'After'
    );
  });

  it('hides invalid dates, warns once per value, and recovers when valid', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    try {
      console.warn = (message?: unknown) => warnings.push(String(message));
      const el = await fixture<TimelineEvent>(html`
        <timeline-event date="2024-02-30"><h3>Invalid</h3></timeline-event>
      `);

      expect(el.hasAttribute('data-invalid-date')).to.be.true;
      expect(getComputedStyle(el).display).to.equal('none');

      el.date = '2023-02-29';
      await el.updateComplete;
      el.date = '2024-02-30';
      await el.updateComplete;

      expect(warnings).to.deep.equal([
        '[timeline-event] Invalid date "2024-02-30"; expected YYYY-MM-DD.',
        '[timeline-event] Invalid date "2023-02-29"; expected YYYY-MM-DD.',
      ]);

      el.date = '2024-02-29';
      await el.updateComplete;
      expect(el.hasAttribute('data-invalid-date')).to.be.false;
      expect(getComputedStyle(el).display).to.equal('block');
    } finally {
      // eslint-disable-next-line require-atomic-updates
      console.warn = originalWarn;
    }
  });
});
