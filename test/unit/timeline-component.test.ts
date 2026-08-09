import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import '../../dist/index.js';
import type { TimelineComponent } from '../../dist/index.js';

async function settleLayout(el: TimelineComponent): Promise<void> {
  await el.updateComplete;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

async function waitFrames(count: number): Promise<void> {
  for (let index = 0; index < count; index++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

function deepestActiveElement(root: Document | ShadowRoot = document): Element | null {
  let active = root.activeElement;
  while (active instanceof HTMLElement && active.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

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

  it('sorts DOM, coordinates, and keyboard navigation chronologically', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-09-15"><h3>Later Event</h3></timeline-event>
        <timeline-event date="2024-03-15"><h3>Earlier Event</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const events = Array.from(el.children) as HTMLElement[];
    expect(events.map((event) => event.getAttribute('date'))).to.deep.equal([
      '2024-03-15',
      '2024-09-15',
    ]);
    expect(parseFloat(events[0].style.left)).to.be.lessThan(parseFloat(events[1].style.left));

    events[0].focus();
    events[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).to.equal(events[1]);
  });

  it('adds a valid event after render to layout and roving tabindex', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const added = document.createElement('timeline-event');
    added.setAttribute('date', '2024-06-15');
    added.innerHTML = '<h3>Added</h3>';
    el.append(added);
    await settleLayout(el);

    expect(added.getAttribute('data-layout-ready')).to.equal('');
    expect(added.style.visibility).to.equal('visible');
    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(2);
    expect(Array.from(el.children).map((event) => event.getAttribute('tabindex'))).to.deep.equal([
      '0',
      '-1',
    ]);
  });

  it('restores a removed event to standalone state', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Removed</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const removed = el.children[1] as HTMLElement;

    removed.remove();
    await settleLayout(el);

    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(1);
    expect(removed.hasAttribute('data-timeline-managed')).to.be.false;
    expect(removed.hasAttribute('data-layout-ready')).to.be.false;
    expect(removed.hasAttribute('data-layout-mode')).to.be.false;
    expect(removed.getAttribute('tabindex')).to.equal('0');
    expect(removed.getAttribute('style')).to.be.null;
  });

  it('reacts to event date changes by reordering and repositioning', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const changed = el.children[1] as HTMLElement;
    const oldLeft = changed.style.left;

    changed.setAttribute('date', '2024-01-15');
    await settleLayout(el);

    expect(el.children[0]).to.equal(changed);
    expect(changed.style.left).not.to.equal(oldLeft);
    expect(parseFloat(changed.style.left)).to.be.lessThan(
      parseFloat((el.children[1] as HTMLElement).style.left)
    );
  });

  it('ignores events inside a nested timeline', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>Outer</h3></timeline-event>
        <timeline-component>
          <timeline-event date="2024-06-15"><h3>Nested</h3></timeline-event>
        </timeline-component>
      </timeline-component>
    `);
    await settleLayout(el);

    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(1);
    expect(el.querySelectorAll(':scope > timeline-event[tabindex]')).to.have.length(1);
    expect(
      el.querySelector('timeline-component timeline-event')!.getAttribute('tabindex')
    ).to.equal('0');
  });

  it('applies either explicit range bound independently and reacts at runtime', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const dotPosition = () =>
      Number(el.shadowRoot!.querySelector('[part="dot"]')!.getAttribute('cx'));
    const automatic = dotPosition();

    el.setAttribute('start-year', '2020');
    await settleLayout(el);
    const startOnly = dotPosition();
    expect(startOnly).not.to.equal(automatic);

    el.removeAttribute('start-year');
    el.setAttribute('end-year', '2030');
    await settleLayout(el);
    const endOnly = dotPosition();
    expect(endOnly).not.to.equal(automatic);

    const labels = Array.from(el.shadowRoot!.querySelectorAll('.marker-text')).map((node) =>
      node.textContent?.trim()
    );
    expect(labels).to.include('2030');
  });

  it('clears geometry and warns once for reversed ranges', async () => {
    const warnings: unknown[][] = [];
    const originalWarn = console.warn;
    Object.defineProperty(console, 'warn', {
      configurable: true,
      value: (...args: unknown[]) => warnings.push(args),
    });
    try {
      const el = await fixture<TimelineComponent>(html`
        <timeline-component start-year="2030" end-year="2020">
          <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
        </timeline-component>
      `);
      await settleLayout(el);
      await settleLayout(el);

      expect(el.shadowRoot!.querySelectorAll('svg path')).to.have.length(0);
      expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(0);
      expect(warnings).to.deep.equal([
        ['[timeline-component] Invalid range 2030–2020; start-year must not exceed end-year.'],
      ]);
    } finally {
      Object.defineProperty(console, 'warn', {
        configurable: true,
        value: originalWarn,
      });
    }
  });

  for (const mode of ['horizontal', 'vertical', 'list'] as const) {
    it(`does not impose oversized dimensions on an empty ${mode} timeline`, async () => {
      const el = await fixture<TimelineComponent>(html`
        <timeline-component ?vertical=${mode === 'vertical'} ?list=${mode === 'list'}>
        </timeline-component>
      `);
      await settleLayout(el);
      const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
      expect(container.style.minWidth).to.equal('');
      expect(container.style.minHeight).to.equal('');
      expect(container.scrollWidth).to.be.lessThan(1800);
      expect(container.scrollHeight).to.be.lessThan(1800);
    });
  }

  it('clears SVG and owned dimensions after removing the final event', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    el.firstElementChild!.remove();
    await settleLayout(el);

    const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
    expect(el.shadowRoot!.querySelectorAll('svg path')).to.have.length(0);
    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(0);
    expect(container.style.minWidth).to.equal('');
    expect(container.style.minHeight).to.equal('');
    expect(container.style.height).to.equal('');
  });

  it('clears mode-owned styles across horizontal, vertical, and list transitions', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const event = el.firstElementChild as HTMLElement;

    el.style.width = '375px';
    el.vertical = true;
    await settleLayout(el);
    expect(event.getAttribute('data-layout-mode')).to.equal('vertical');
    expect(event.style.maxWidth).not.to.equal('');
    expect(el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!.style.width).to.equal(
      ''
    );

    el.vertical = false;
    await settleLayout(el);
    expect(event.getAttribute('data-layout-mode')).to.equal('horizontal');
    expect(event.style.maxWidth).to.equal('');
    expect(event.style.left).not.to.equal('');

    el.list = true;
    await settleLayout(el);
    expect(event.style.left).to.equal('');
    expect(event.style.top).to.equal('');
    expect(event.style.position).to.equal('relative');

    el.list = false;
    await settleLayout(el);
    expect(event.getAttribute('data-layout-mode')).to.equal('horizontal');
    expect(event.style.position).to.equal('absolute');
  });

  it('matches a fresh destination layout after each mode transition', async () => {
    type Mode = 'horizontal' | 'vertical' | 'list';
    const parent = document.createElement('div');
    parent.style.width = '375px';
    document.body.append(parent);

    const create = async (mode: Mode): Promise<TimelineComponent> => {
      const component = document.createElement('timeline-component') as TimelineComponent;
      component.vertical = mode === 'vertical';
      component.list = mode === 'list';
      component.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
      parent.append(component);
      await settleLayout(component);
      return component;
    };
    const snapshot = (component: TimelineComponent) => {
      const container = component.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
      const event = component.firstElementChild as HTMLElement;
      return {
        axis: component.shadowRoot!.querySelector('[part="axis-line"]')?.getAttribute('d') ?? '',
        container: [
          container.style.width,
          container.style.height,
          container.style.minWidth,
          container.style.minHeight,
        ],
        event: [event.style.position, event.style.left, event.style.top, event.style.maxWidth],
      };
    };

    for (const [source, destination] of [
      ['horizontal', 'vertical'],
      ['vertical', 'horizontal'],
      ['list', 'horizontal'],
    ] as [Mode, Mode][]) {
      const transitioned = await create(source);
      transitioned.vertical = destination === 'vertical';
      transitioned.list = destination === 'list';
      await settleLayout(transitioned);
      const fresh = await create(destination);
      expect(snapshot(transitioned)).to.deep.equal(snapshot(fresh));
      transitioned.remove();
      fresh.remove();
    }
    parent.remove();
  });

  it('keeps invalid direct events hidden, last, and out of roving navigation', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="not-a-date"><h3>Invalid</h3></timeline-event>
        <timeline-event date="2024-06-15"><h3>Valid</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const [valid, invalid] = Array.from(el.children) as HTMLElement[];

    expect(valid.getAttribute('date')).to.equal('2024-06-15');
    expect(invalid.getAttribute('date')).to.equal('not-a-date');
    expect(valid.getAttribute('tabindex')).to.equal('0');
    expect(invalid.getAttribute('tabindex')).to.equal('-1');
    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(1);
  });

  it('remains responsive after detach and reconnect', async () => {
    const parent = document.createElement('div');
    parent.style.width = '700px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
    parent.append(el);
    await settleLayout(el);
    const axis = () =>
      Number(
        /^M ([\d.]+),/.exec(
          el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('d') || ''
        )?.[1]
      );
    const wideAxis = axis();

    el.remove();
    parent.style.width = '400px';
    parent.append(el);
    await settleLayout(el);

    const reconnectedAxis = axis();
    expect(reconnectedAxis).not.to.equal(wideAxis);

    parent.style.width = '800px';
    await settleLayout(el);
    expect(axis()).not.to.equal(reconnectedAxis);
    expect(el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!.style.width).to.equal(
      ''
    );
    parent.remove();
  });

  it('responds to vertical parent width changes in both directions', async () => {
    const parent = document.createElement('div');
    parent.style.width = '700px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
    parent.append(el);
    await settleLayout(el);
    const axisPath = () =>
      el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('d') || '';
    const wide = axisPath();

    parent.style.width = '320px';
    await settleLayout(el);
    const narrow = axisPath();
    parent.style.width = '800px';
    await settleLayout(el);

    expect(narrow).not.to.equal(wide);
    expect(axisPath()).not.to.equal(narrow);
    expect(el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!.style.width).to.equal(
      ''
    );
    parent.remove();
  });

  for (const width of [320, 375]) {
    it(`keeps ${width}px vertical geometry non-negative and on the right`, async () => {
      const parent = document.createElement('div');
      parent.style.width = `${width}px`;
      document.body.append(parent);
      const el = document.createElement('timeline-component') as TimelineComponent;
      el.vertical = true;
      el.innerHTML = `
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>`;
      parent.append(el);
      await settleLayout(el);

      const wrapper = el.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!;
      const axisPath = el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('d')!;
      const axisX = Number(axisPath.match(/^M ([\d.]+),/)?.[1]);
      expect(axisX).to.be.at.least(0);
      for (const event of Array.from(el.children) as HTMLElement[]) {
        expect(parseFloat(event.style.left)).to.be.at.least(axisX + 30);
        expect(event.getBoundingClientRect().left).to.be.at.least(
          parent.getBoundingClientRect().left
        );
        expect(event.getBoundingClientRect().right).to.be.at.most(
          parent.getBoundingClientRect().right
        );
      }
      for (const marker of Array.from(
        el.shadowRoot!.querySelectorAll<SVGTextElement>('[part="marker-text"]')
      )) {
        expect(marker.getBoundingClientRect().left).to.be.at.least(
          parent.getBoundingClientRect().left
        );
      }
      expect(wrapper.scrollWidth).to.be.at.most(wrapper.clientWidth);
      parent.remove();
    });
  }

  it('keeps a mobile marker-aligned date label out of its card gutter', async () => {
    const parent = document.createElement('div');
    parent.style.width = '320px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = '<timeline-event date="2024-06-01"><h3>Event</h3></timeline-event>';
    parent.append(el);
    await settleLayout(el);

    const eventRect = el.firstElementChild!.getBoundingClientRect();
    const marker = Array.from(
      el.shadowRoot!.querySelectorAll<SVGTextElement>('[part="marker-text"]')
    ).find((candidate) => candidate.textContent === 'Jun 24')!;
    const markerRect = marker.getBoundingClientRect();
    const intersects =
      markerRect.left < eventRect.right &&
      markerRect.right > eventRect.left &&
      markerRect.top < eventRect.bottom &&
      markerRect.bottom > eventRect.top;

    expect(intersects).to.be.false;
    expect(markerRect.left).to.be.at.least(parent.getBoundingClientRect().left);
    expect(markerRect.right).to.be.at.most(eventRect.left);
    parent.remove();
  });

  it('measures externally styled marker typography in mobile vertical layout', async () => {
    const style = document.createElement('style');
    style.textContent = `
      timeline-component.large-marker-test::part(marker-text) {
        font-size: 24px;
      }
    `;
    document.head.append(style);

    const parent = document.createElement('div');
    parent.style.width = '320px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.className = 'large-marker-test';
    el.vertical = true;
    el.innerHTML = '<timeline-event date="2024-06-01"><h3>Event</h3></timeline-event>';
    parent.append(el);
    await settleLayout(el);

    const parentRect = parent.getBoundingClientRect();
    const wrapper = el.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!;
    const axisPath = el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('d')!;
    const axisX = Number(axisPath.match(/^M ([\d.]+),/)?.[1]);
    const event = el.firstElementChild as HTMLElement;
    const eventRect = event.getBoundingClientRect();
    const marker = Array.from(
      el.shadowRoot!.querySelectorAll<SVGTextElement>('[part="marker-text"]')
    ).find((candidate) => candidate.textContent === 'Jun 24')!;
    const markerRect = marker.getBoundingClientRect();
    const intersects =
      markerRect.left < eventRect.right &&
      markerRect.right > eventRect.left &&
      markerRect.top < eventRect.bottom &&
      markerRect.bottom > eventRect.top;

    expect(markerRect.left).to.be.at.least(parentRect.left);
    expect(intersects).to.be.false;
    expect(parseFloat(event.style.left)).to.be.at.least(axisX + 30);
    expect(eventRect.right).to.be.at.most(parentRect.right);
    expect(wrapper.scrollWidth).to.be.at.most(wrapper.clientWidth);

    parent.remove();
    style.remove();
  });

  it('alternates vertical event sides at 600px', async () => {
    const parent = document.createElement('div');
    parent.style.width = '600px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = `
      <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
      <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>`;
    parent.append(el);
    await settleLayout(el);

    const [first, second] = Array.from(el.children) as HTMLElement[];
    expect(parseFloat(first.style.left) + first.offsetWidth).to.be.lessThan(300);
    expect(parseFloat(second.style.left)).to.be.greaterThan(300);
    parent.remove();
  });

  it('keeps events at explicit range boundaries within horizontal content', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component start-year="2024" end-year="2024">
        <timeline-event date="2024-01-01"><h3>Start</h3></timeline-event>
        <timeline-event date="2024-12-31"><h3>End</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
    for (const event of Array.from(el.children) as HTMLElement[]) {
      expect(parseFloat(event.style.left)).to.be.at.least(0);
      expect(parseFloat(event.style.left) + event.offsetWidth).to.be.at.most(container.scrollWidth);
    }
  });

  it('navigates from nested focused content in chronological order', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-09-15"><button>Later</button></timeline-event>
        <timeline-event date="2024-03-15"><button>Earlier</button></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const [earlier, later] = Array.from(el.children) as HTMLElement[];
    const button = earlier.querySelector('button')!;
    button.focus();
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true })
    );
    expect(document.activeElement).to.equal(later);

    later.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).to.equal(earlier);
  });

  it('synchronizes roving tabindex when an event receives focus', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const [first, second] = Array.from(el.children) as HTMLElement[];

    second.focus();
    expect(second.getAttribute('tabindex')).to.equal('0');
    expect(first.getAttribute('tabindex')).to.equal('-1');

    first.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    expect(first.getAttribute('tabindex')).to.equal('0');
    expect(second.getAttribute('tabindex')).to.equal('-1');
  });

  for (const label of [undefined, '']) {
    it(`falls back to Timeline for ${label === undefined ? 'omitted' : 'empty'} labels`, async () => {
      const el = await fixture<TimelineComponent>(
        label === undefined
          ? html`<timeline-component></timeline-component>`
          : html`<timeline-component label=""></timeline-component>`
      );
      expect(el.shadowRoot!.querySelector('.scroll-wrapper')!.getAttribute('aria-label')).to.equal(
        'Timeline'
      );
    });
  }

  it('applies composed list semantics to the wrapper and direct event hosts', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component list>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const wrapper = el.shadowRoot!.querySelector('.scroll-wrapper')!;
    expect(wrapper.getAttribute('role')).to.equal('list');
    expect(wrapper.getAttribute('aria-label')).to.equal('Timeline');
    expect(wrapper.getAttribute('tabindex')).to.equal('0');
    expect(el.shadowRoot!.querySelector('slot')!.getAttribute('role')).to.equal('presentation');
    // The container sits between the list and its items, so it must not occupy the a11y tree.
    expect(el.shadowRoot!.querySelector('.timeline-container')!.getAttribute('role')).to.equal(
      'presentation'
    );
    for (const event of Array.from(el.children)) {
      expect(event.getAttribute('role')).to.equal('listitem');
      expect(event.getAttribute('data-layout-mode')).to.equal('list');
    }
  });

  it('leaves the container out of the a11y tree only in list mode', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    expect(el.shadowRoot!.querySelector('.timeline-container')!.hasAttribute('role')).to.be.false;
  });

  for (const mode of ['list', 'vertical'] as const) {
    it(`keeps the author role when a ${mode} update lands before slotchange`, async () => {
      const el = await fixture<TimelineComponent>(html`<timeline-component></timeline-component>`);
      await settleLayout(el);

      const event = document.createElement('timeline-event');
      event.setAttribute('date', '2024-06-15');
      event.setAttribute('role', 'note');

      // Assigning a property queues Lit's update microtask ahead of the slotchange microtask,
      // so `_refreshEventAttributes` sees the event before `_syncEvents` has snapshotted it.
      el[mode] = true;
      el.append(event);
      await settleLayout(el);

      el[mode] = false;
      await settleLayout(el);
      event.remove();
      await settleLayout(el);

      expect(event.getAttribute('role')).to.equal('note');
    });
  }

  it('clears the reorder guard so later slot changes still resync', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-09-15"><h3>Late</h3></timeline-event>
        <timeline-event date="2024-03-15"><h3>Early</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    // The initial sync reorders the light DOM; a subsequent append must still be picked up.
    expect(Array.from(el.children).map((child) => child.getAttribute('date'))).to.deep.equal([
      '2024-03-15',
      '2024-09-15',
    ]);

    const event = document.createElement('timeline-event');
    event.setAttribute('date', '2024-06-15');
    el.append(event);
    await settleLayout(el);

    expect(Array.from(el.children).map((child) => child.getAttribute('date'))).to.deep.equal([
      '2024-03-15',
      '2024-06-15',
      '2024-09-15',
    ]);
    expect(event.hasAttribute('data-timeline-managed')).to.be.true;
  });

  it('falls back to yearly markers when a span straddles no multiple of five', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2021-06-15"><h3>First</h3></timeline-event>
        <timeline-event date="2023-06-15"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const labels = Array.from(el.shadowRoot!.querySelectorAll('[part="marker-text"]')).map(
      (text) => text.textContent
    );
    expect(labels).to.deep.equal(['2021', '2022', '2023']);
  });

  it('keeps the five-year step for long spans', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="1972-08-13"><h3>First</h3></timeline-event>
        <timeline-event date="2001-04-21"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const labels = Array.from(el.shadowRoot!.querySelectorAll('[part="marker-text"]')).map(
      (text) => text.textContent
    );
    expect(labels).to.deep.equal(['1975', '1980', '1985', '1990', '1995', '2000']);
  });

  it('becomes quiescent after layout and does not continuously update', async () => {
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
    document.body.append(el);

    await settleLayout(el);
    await waitFrames(4);
    const settledUpdate = el.updateComplete;
    await settledUpdate;
    await waitFrames(8);

    expect(el.updateComplete).to.equal(settledUpdate);
    el.remove();
  });

  it('preserves the deepest focused descendant when an attribute date change reorders events', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><button>First control</button></timeline-event>
        <timeline-event date="2024-09-15"><button>Second control</button></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const moved = el.children[1] as HTMLElement;
    const focusedButton = moved.querySelector('button')!;
    focusedButton.focus();

    moved.setAttribute('date', '2024-01-15');
    await settleLayout(el);

    expect(el.firstElementChild).to.equal(moved);
    expect(deepestActiveElement()).to.equal(focusedButton);
  });

  it('reacts to both date property and date attribute changes', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-03-15"><h3>First</h3></timeline-event>
        <timeline-event date="2024-09-15"><h3>Second</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const first = el.children[0] as HTMLElement & {
      date: string;
      updateComplete: Promise<boolean>;
    };
    const second = el.children[1] as HTMLElement;

    first.date = '2024-12-15';
    await first.updateComplete;
    await settleLayout(el);
    expect(first.getAttribute('date')).to.equal('2024-12-15');
    expect(el.lastElementChild).to.equal(first);

    second.setAttribute('date', '2025-01-15');
    await settleLayout(el);
    expect(el.lastElementChild).to.equal(second);
  });

  it('measures mobile vertical cards after applying their wrapping max-width', async () => {
    const parent = document.createElement('div');
    parent.style.width = '320px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = `
      <timeline-event date="2024-06-15" style="--timeline-event-width: 520px; --timeline-event-content-min-height: 0">
        <div style="font-size: 20px">This deliberately long timeline event content wraps across many lines after the mobile maximum width is applied so its rendered height changes materially.</div>
      </timeline-event>`;
    parent.append(el);
    await settleLayout(el);

    const event = el.firstElementChild as HTMLElement;
    const dotY = Number(el.shadowRoot!.querySelector('[part="dot"]')!.getAttribute('cy'));
    const eventCenter = parseFloat(event.style.top) + event.offsetHeight / 2;
    expect(event.offsetWidth).to.be.at.most(250);
    expect(eventCenter).to.be.closeTo(dotY, 1);
    parent.remove();
  });

  it('packs near-date vertical events without overlap on each side and bounds connectors', async () => {
    const parent = document.createElement('div');
    parent.style.width = '800px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = [
      '2024-06-15',
      '2024-06-15',
      '2024-06-16',
      '2024-06-16',
      '2024-06-17',
      '2024-06-17',
    ]
      .map(
        (date, index) =>
          `<timeline-event date="${date}"><h3>Event ${index}</h3><p>Collision content</p></timeline-event>`
      )
      .join('');
    parent.append(el);
    await settleLayout(el);

    const events = Array.from(el.children) as HTMLElement[];
    for (const side of [
      events.filter((_, index) => index % 2 === 0),
      events.filter((_, index) => index % 2 === 1),
    ]) {
      for (let firstIndex = 0; firstIndex < side.length; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < side.length; secondIndex++) {
          const first = side[firstIndex].getBoundingClientRect();
          const second = side[secondIndex].getBoundingClientRect();
          expect(first.bottom <= second.top || second.bottom <= first.top).to.be.true;
        }
      }
    }

    const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
    const containerTop = container.getBoundingClientRect().top;
    for (const event of events) {
      expect(parseFloat(event.style.top) + event.offsetHeight).to.be.at.most(
        container.scrollHeight
      );
    }
    const connectorPaths = Array.from(
      el.shadowRoot!.querySelectorAll<SVGPathElement>('[part="connector-line"]')
    );
    expect(connectorPaths).to.have.length(events.length);
    connectorPaths.forEach((path, index) => {
      const startY = Number(/^M [^,]+,([\d.]+)/.exec(path.getAttribute('d') || '')?.[1]);
      const rect = events[index].getBoundingClientRect();
      expect(startY).to.be.closeTo(rect.top - containerTop + rect.height / 2, 1);
    });
    parent.remove();
  });

  it('works as a black box inside a real outer shadow root and preserves nested focus', async () => {
    const outer = document.createElement('div');
    const root = outer.attachShadow({ mode: 'open' });
    const el = document.createElement('timeline-component') as TimelineComponent;
    const later = document.createElement('timeline-event');
    later.setAttribute('date', '2024-09-15');
    later.innerHTML = '<button>Focused descendant</button>';
    const earlier = document.createElement('timeline-event');
    earlier.setAttribute('date', '2024-03-15');
    earlier.innerHTML = '<h3>Earlier</h3>';
    const invalid = document.createElement('timeline-event');
    invalid.setAttribute('date', 'invalid');
    invalid.innerHTML = '<h3>Invalid</h3>';
    el.append(later, invalid, earlier);
    root.append(el);
    document.body.append(outer);
    await settleLayout(el);

    expect(Array.from(el.children).map((event) => event.getAttribute('date'))).to.deep.equal([
      '2024-03-15',
      '2024-09-15',
      'invalid',
    ]);
    expect(getComputedStyle(invalid).display).to.equal('none');
    expect(invalid.hasAttribute('data-layout-ready')).to.be.false;
    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(2);

    const button = later.querySelector('button')!;
    button.focus();
    later.setAttribute('date', '2024-01-15');
    await settleLayout(el);
    expect(el.firstElementChild).to.equal(later);
    expect(deepestActiveElement(root)).to.equal(button);
    outer.remove();
  });

  it('reacts to rendered event size changes', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-06-15"><h3>Resizable</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);
    const event = el.firstElementChild as HTMLElement;
    const beforeLeft = event.style.left;

    event.style.setProperty('--timeline-event-width', '420px');
    await waitFrames(4);

    expect(event.offsetWidth).to.equal(420);
    expect(event.style.left).not.to.equal(beforeLeft);
  });

  it('restores author role, tabindex, and owned inline styles when management ends', async () => {
    const event = document.createElement('timeline-event');
    event.setAttribute('date', '2024-06-15');
    event.setAttribute('role', 'article');
    event.setAttribute('tabindex', '7');
    event.style.position = 'sticky';
    event.style.left = '11px';
    event.style.top = '12px';
    event.style.maxWidth = '333px';
    event.style.visibility = 'collapse';
    const el = await fixture<TimelineComponent>(html`<timeline-component></timeline-component>`);
    el.append(event);
    await settleLayout(el);
    event.remove();
    await settleLayout(el);

    expect(event.getAttribute('role')).to.equal('article');
    expect(event.getAttribute('tabindex')).to.equal('7');
    expect(event.style.position).to.equal('sticky');
    expect(event.style.left).to.equal('11px');
    expect(event.style.top).to.equal('12px');
    expect(event.style.maxWidth).to.equal('333px');
    expect(event.style.visibility).to.equal('collapse');
  });

  it('keeps mobile vertical marker labels fully inside the viewport', async () => {
    const parent = document.createElement('div');
    parent.style.width = '320px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
    parent.append(el);
    await settleLayout(el);

    const parentRect = parent.getBoundingClientRect();
    for (const marker of Array.from(
      el.shadowRoot!.querySelectorAll<SVGTextElement>('[part="marker-text"]')
    )) {
      const rect = marker.getBoundingClientRect();
      expect(rect.left).to.be.at.least(parentRect.left);
      expect(rect.right).to.be.at.most(parentRect.right);
    }
    parent.remove();
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

  it('lays out canonical years 0001 and 0099 with finite geometry and padded markers', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component start-year="1" end-year="99">
        <timeline-event date="0001-06-15"><h3>Year one</h3></timeline-event>
        <timeline-event date="0099-06-15"><h3>Year ninety-nine</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const axis = el.shadowRoot!.querySelector<SVGPathElement>('[part="axis-line"]')!;
    expect(axis.getAttribute('d')).not.to.match(/NaN|Infinity/);
    for (const dot of Array.from(el.shadowRoot!.querySelectorAll('[part="dot"]'))) {
      expect(Number.isFinite(Number(dot.getAttribute('cx')))).to.be.true;
    }
    for (const event of Array.from(el.children) as HTMLElement[]) {
      expect(event.hasAttribute('data-layout-ready')).to.be.true;
      expect(Number.isFinite(parseFloat(event.style.left))).to.be.true;
    }
    const labels = Array.from(el.shadowRoot!.querySelectorAll('.marker-text')).map((marker) =>
      marker.textContent?.trim()
    );
    expect(labels).to.include('0005');
    expect(labels).to.include('0095');
  });

  for (const { attribute, value, warning } of [
    {
      attribute: 'start-year',
      value: 'not-a-number',
      warning: '[timeline-component] Invalid start-year NaN; expected an integer from 1 to 9999.',
    },
    {
      attribute: 'start-year',
      value: '1.5',
      warning: '[timeline-component] Invalid start-year 1.5; expected an integer from 1 to 9999.',
    },
    {
      attribute: 'start-year',
      value: '0',
      warning: '[timeline-component] Invalid start-year 0; expected an integer from 1 to 9999.',
    },
    {
      attribute: 'end-year',
      value: '10000',
      warning: '[timeline-component] Invalid end-year 10000; expected an integer from 1 to 9999.',
    },
  ]) {
    it(`clears layout for invalid ${attribute}=${value}`, async () => {
      const warnings: string[] = [];
      const originalWarn = console.warn;
      try {
        console.warn = (message?: unknown) => warnings.push(String(message));
        const el = await fixture<TimelineComponent>(html`
          <timeline-component>
            <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
          </timeline-component>
        `);
        el.setAttribute(attribute, value);
        await settleLayout(el);
        await settleLayout(el);

        expect(warnings).to.deep.equal([warning]);
        expect(el.shadowRoot!.querySelectorAll('[part="axis-line"], [part="dot"]')).to.have.length(
          0
        );
        expect(el.firstElementChild!.hasAttribute('data-layout-ready')).to.be.false;
        expect(el.shadowRoot!.innerHTML).not.to.match(/NaN|Infinity/);
      } finally {
        // eslint-disable-next-line require-atomic-updates
        console.warn = originalWarn;
      }
    });
  }

  it('clears layout for a non-finite property range bound', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    try {
      console.warn = (message?: unknown) => warnings.push(String(message));
      const el = await fixture<TimelineComponent>(html`
        <timeline-component>
          <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
        </timeline-component>
      `);
      el.endYear = Number.POSITIVE_INFINITY;
      await settleLayout(el);

      expect(warnings).to.deep.equal([
        '[timeline-component] Invalid end-year Infinity; expected an integer from 1 to 9999.',
      ]);
      expect(el.shadowRoot!.querySelectorAll('[part="axis-line"], [part="dot"]')).to.have.length(0);
      expect(el.firstElementChild!.hasAttribute('data-layout-ready')).to.be.false;
    } finally {
      // eslint-disable-next-line require-atomic-updates
      console.warn = originalWarn;
    }
  });

  it('restores managed child state when the parent disconnects before extraction', async () => {
    const parent = document.createElement('div');
    const el = document.createElement('timeline-component') as TimelineComponent;
    const event = document.createElement('timeline-event');
    event.setAttribute('date', '2024-06-15');
    event.setAttribute('role', 'note');
    event.setAttribute('tabindex', '4');
    event.style.position = 'sticky';
    event.style.left = '9px';
    el.append(event);
    parent.append(el);
    document.body.append(parent);
    await settleLayout(el);

    parent.remove();
    event.remove();
    document.body.append(event);
    await (event as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;

    expect(event.hasAttribute('data-timeline-managed')).to.be.false;
    expect(event.hasAttribute('data-layout-ready')).to.be.false;
    expect(event.hasAttribute('data-layout-mode')).to.be.false;
    expect(event.getAttribute('role')).to.equal('note');
    expect(event.getAttribute('tabindex')).to.equal('4');
    expect(event.style.position).to.equal('sticky');
    expect(event.style.left).to.equal('9px');

    event.remove();
    document.body.append(el);
    await settleLayout(el);
    expect(el.shadowRoot!.querySelectorAll('[part="dot"]')).to.have.length(0);
    el.remove();
  });

  it('uses cumulative horizontal row heights for tall customized cards', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component>
        <timeline-event date="2024-06-15" style="--timeline-event-image-height: 500px">
          <h3>First</h3>
        </timeline-event>
        <timeline-event date="2024-06-15" style="--timeline-event-image-height: 500px">
          <h3>Second</h3>
        </timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const [first, second] = Array.from(el.children).map((event) => event.getBoundingClientRect());
    expect(first.bottom + 29).to.be.at.most(second.top);
  });

  it('precomputes enough two-sided width for 520px cards at the desktop breakpoint', async () => {
    const parent = document.createElement('div');
    parent.style.width = '600px';
    document.body.append(parent);
    const el = document.createElement('timeline-component') as TimelineComponent;
    el.vertical = true;
    el.innerHTML = `
      <timeline-event date="2024-06-15" style="--timeline-event-width: 520px"><h3>First</h3></timeline-event>
      <timeline-event date="2024-06-15" style="--timeline-event-width: 520px"><h3>Second</h3></timeline-event>`;
    parent.append(el);
    await settleLayout(el);

    const [first, second] = Array.from(el.children).map((event) => event.getBoundingClientRect());
    expect(first.right).to.be.at.most(second.left);
    const axisPath = el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('d')!;
    const axisX = Number(axisPath.match(/^M ([\d.]+),/)?.[1]);
    const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;
    expect(first.right - container.getBoundingClientRect().left).to.be.at.most(axisX);
    expect(second.left - container.getBoundingClientRect().left).to.be.at.least(axisX);
    parent.remove();
  });

  for (const width of [320, 375]) {
    it(`constrains an externally widened card part at ${width}px`, async () => {
      const style = document.createElement('style');
      style.textContent =
        'timeline-component.part-width-test timeline-event::part(card) { width: 600px; }';
      document.head.append(style);
      const parent = document.createElement('div');
      parent.style.width = `${width}px`;
      document.body.append(parent);
      const el = document.createElement('timeline-component') as TimelineComponent;
      el.className = 'part-width-test';
      el.vertical = true;
      el.innerHTML = '<timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>';
      parent.append(el);
      await settleLayout(el);

      const event = el.firstElementChild as HTMLElement & { shadowRoot: ShadowRoot };
      const card = event.shadowRoot.querySelector<HTMLElement>('[part="card"]')!;
      const hostRect = event.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const wrapper = el.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!;
      expect(cardRect.left).to.be.at.least(hostRect.left);
      expect(cardRect.right).to.be.at.most(hostRect.right);
      expect(wrapper.scrollWidth).to.be.at.most(wrapper.clientWidth);
      parent.remove();
      style.remove();
    });
  }

  it('wires timeline color variables and keeps documented SVG fallbacks', async () => {
    const el = await fixture<TimelineComponent>(html`
      <timeline-component
        style="--timeline-marker-text-color: rgb(1, 2, 3); --timeline-scrollbar-thumb-color: rgb(4, 5, 6); --timeline-scrollbar-track-color: rgb(7, 8, 9)"
      >
        <timeline-event date="2024-06-15"><h3>Event</h3></timeline-event>
      </timeline-component>
    `);
    await settleLayout(el);

    const marker = el.shadowRoot!.querySelector<SVGTextElement>('[part="marker-text"]')!;
    const wrapper = el.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!;
    expect(getComputedStyle(marker).fill).to.equal('rgb(1, 2, 3)');
    const scrollbarColor = getComputedStyle(wrapper).scrollbarColor;
    if (scrollbarColor !== undefined) {
      expect(scrollbarColor).to.equal('rgb(4, 5, 6) rgb(7, 8, 9)');
    }
    expect(el.shadowRoot!.querySelector('[part="axis-line"]')!.getAttribute('stroke')).to.equal(
      'var(--timeline-axis-color, #47476b)'
    );
    expect(
      el.shadowRoot!.querySelector('[part="connector-line"]')!.getAttribute('stroke')
    ).to.equal('var(--timeline-connector-color, #47476b)');
    expect(el.shadowRoot!.querySelector('[part="marker-tick"]')!.getAttribute('stroke')).to.equal(
      'var(--timeline-marker-color, #a4a4c1)'
    );
    expect(el.shadowRoot!.querySelector('[part="dot"]')!.getAttribute('fill')).to.equal(
      'var(--timeline-dot-color, #ff6b6b)'
    );
  });

  it('keeps an all-invalid timeline free of SVG and owned dimensions', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    try {
      console.warn = (message?: unknown) => warnings.push(String(message));
      const el = await fixture<TimelineComponent>(html`
        <timeline-component>
          <timeline-event date="invalid"><h3>First invalid</h3></timeline-event>
          <timeline-event date="2024-02-30"><h3>Second invalid</h3></timeline-event>
        </timeline-component>
      `);
      await settleLayout(el);
      const container = el.shadowRoot!.querySelector<HTMLElement>('.timeline-container')!;

      expect(el.shadowRoot!.querySelectorAll('[part="axis-line"], [part="dot"]')).to.have.length(0);
      expect(container.style.minWidth).to.equal('');
      expect(container.style.minHeight).to.equal('');
      expect(container.style.width).to.equal('');
      expect(container.style.height).to.equal('');
      expect(container.scrollWidth).to.be.lessThan(1800);
      expect(container.scrollHeight).to.be.lessThan(1800);
      for (const event of Array.from(el.children)) {
        expect(event.hasAttribute('data-layout-ready')).to.be.false;
      }
      expect(warnings).to.have.length(2);
    } finally {
      // eslint-disable-next-line require-atomic-updates
      console.warn = originalWarn;
    }
  });
});
