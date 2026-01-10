import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/index.js';
import type { TimelineEvent } from '../../dist/index.js';

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

  it('is keyboard accessible', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    expect(el.getAttribute('tabindex')).to.equal('0');
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

  it('includes visually hidden date for screen readers', async () => {
    const el = await fixture<TimelineEvent>(html`
      <timeline-event date="2024-03-15">
        <h3>Test</h3>
      </timeline-event>
    `);

    const hiddenDate = el.shadowRoot!.querySelector('.visually-hidden');
    expect(hiddenDate).to.exist;
    expect(hiddenDate?.textContent).to.contain('March 15, 2024');
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

    const hiddenDate = el.shadowRoot!.querySelector('.visually-hidden');
    expect(hiddenDate?.textContent).to.contain('June 20, 2025');
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
});
