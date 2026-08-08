import { LitElement, html, svg, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { timelineComponentStyles } from '../styles/timeline-component.styles.js';
import type { EventLayout, SVGData, MarkerData } from '../types/index.js';
import { isValidDate } from '../utils/date-utils.js';
import type { TimelineEvent } from './timeline-event.js';

interface DateRangeData {
  startDate: Date;
  endDate: Date;
  sortedEvents: {
    el: TimelineEvent;
    date: string;
    width: number;
    height: number;
  }[];
}

interface ManagedEventSnapshot {
  role: string | null;
  tabindex: string | null;
  styles: Record<string, { value: string; priority: string }>;
}

interface MarkerEntry {
  date: string;
  content: string | number;
}

const OWNED_EVENT_STYLE_PROPERTIES = [
  'position',
  'left',
  'top',
  'max-width',
  'visibility',
] as const;

const EMPTY_SVG_DATA: SVGData = {
  axisPath: '',
  connectors: [],
  dots: [],
  markers: [],
};

/**
 * A timeline container component that positions events chronologically.
 *
 * @slot - Default slot for timeline-event elements
 *
 * @csspart scroll-wrapper - The scrollable container wrapper
 * @csspart container - The main timeline container
 * @csspart svg-layer - The SVG layer containing axis, connectors, and markers
 * @csspart axis-line - The main timeline axis line
 * @csspart connector-line - Lines connecting events to the axis
 * @csspart marker-tick - Date marker tick marks
 * @csspart marker-text - Date marker text labels
 * @csspart dot - Event dots on the axis
 *
 * @cssprop [--timeline-axis-color=#47476b] - Color of the main timeline axis
 * @cssprop [--timeline-axis-width=2] - Width of the timeline axis line
 * @cssprop [--timeline-connector-color=#47476b] - Color of event connector lines
 * @cssprop [--timeline-connector-width=2] - Width of connector lines
 * @cssprop [--timeline-dot-color=#ff6b6b] - Color of event dots on axis
 * @cssprop [--timeline-dot-size=5] - Radius of event dots on axis
 * @cssprop [--timeline-marker-color=#a4a4c1] - Color of date marker ticks
 * @cssprop [--timeline-marker-text-color=#a4a4c1] - Color of date marker text
 * @cssprop [--timeline-marker-font-size=0.9rem] - Font size of date markers
 * @cssprop [--timeline-h-row-gap=330px] - Vertical gap between rows (horizontal mode)
 * @cssprop [--timeline-v-column-gap=100px] - Horizontal gap between columns (vertical mode)
 * @cssprop [--timeline-scrollbar-thumb-color=#47476b] - Scrollbar thumb color
 * @cssprop [--timeline-scrollbar-track-color=transparent] - Scrollbar track color
 * @cssprop [--timeline-list-gap=16px] - Gap between events in list mode
 * @cssprop [--timeline-list-padding=20px] - Padding inside the container in list mode
 */
@customElement('timeline-component')
export class TimelineComponent extends LitElement {
  static override styles = timelineComponentStyles;

  /** Override the automatically detected timeline start year. */
  @property({ type: Number, attribute: 'start-year' })
  startYear?: number;

  /** Override the automatically detected timeline end year. */
  @property({ type: Number, attribute: 'end-year' })
  endYear?: number;

  /** Display the timeline vertically instead of horizontally. */
  @property({ type: Boolean })
  vertical = false;

  /** Display events as a list without an axis. */
  @property({ type: Boolean })
  list = false;

  /** Accessible label for the timeline region. */
  @property({ type: String })
  label = '';

  @state()
  private _eventLayouts: EventLayout[] = [];

  @state()
  private _svgData: SVGData = EMPTY_SVG_DATA;

  private _events: TimelineEvent[] = [];
  private _managedEvents: TimelineEvent[] = [];
  private _eventMutationObserver = new MutationObserver(() => this._syncEvents());
  private _eventResizeObserver = new ResizeObserver(() => this._scheduleLayout());
  private _wrapperResizeObserver = new ResizeObserver(() => this._scheduleLayout());
  private _observedWrapper?: HTMLElement;
  private _layoutScheduled = false;
  private _reorderingEvents = false;
  private _activeEventIndex = 0;
  private readonly _eventSnapshots = new WeakMap<TimelineEvent, ManagedEventSnapshot>();
  private readonly _warnedRanges = new Set<string>();
  private readonly MIN_CONTENT_DIM = 1800;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown);
    this.addEventListener('focusin', this._handleFocusIn);
    void this.updateComplete.then(() => {
      if (this.isConnected) {
        this._observeWrapper();
        this._syncEvents();
      }
    });
  }

  override disconnectedCallback(): void {
    this._eventMutationObserver.disconnect();
    this._eventResizeObserver.disconnect();
    this._wrapperResizeObserver.disconnect();
    this._observedWrapper = undefined;
    this.removeEventListener('keydown', this._handleKeyDown);
    this.removeEventListener('focusin', this._handleFocusIn);
    if (this._layoutScheduled) {
      this._layoutScheduled = false;
    }
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this._observeWrapper();
    this._syncEvents();
  }

  protected override updated(changedProperties: PropertyValues<TimelineComponent>): void {
    this._observeWrapper();
    if (
      changedProperties.has('vertical') ||
      changedProperties.has('list') ||
      changedProperties.has('startYear') ||
      changedProperties.has('endYear')
    ) {
      this._refreshEventAttributes();
      this._scheduleLayout();
    }
  }

  private _observeWrapper(): void {
    if (!this.isConnected) {
      return;
    }
    const wrapper = this.shadowRoot?.querySelector<HTMLElement>('.scroll-wrapper');
    if (!wrapper || wrapper === this._observedWrapper) {
      return;
    }
    this._wrapperResizeObserver.disconnect();
    this._wrapperResizeObserver.observe(wrapper);
    this._observedWrapper = wrapper;
  }

  private _handleSlotChange = (): void => {
    if (!this._reorderingEvents) {
      this._syncEvents();
    }
  };

  private _getDirectEvents(): TimelineEvent[] {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('#timeline-events');
    if (!slot) {
      return [];
    }
    return slot
      .assignedElements({ flatten: false })
      .filter((element): element is TimelineEvent => element.tagName === 'TIMELINE-EVENT');
  }

  private _syncEvents(): void {
    if (!this.isConnected) {
      return;
    }

    const current = this._getDirectEvents();
    const activeElement = this._deepestActiveElement();
    const focused = this._events.find((event) => this._composedContains(event, activeElement));

    for (const event of this._managedEvents) {
      if (!current.includes(event)) {
        this._restoreStandaloneEvent(event);
      }
    }

    this._eventMutationObserver.disconnect();
    this._eventResizeObserver.disconnect();

    const valid = current
      .filter((event) => isValidDate(event.date))
      .sort((a, b) => this._timestamp(a.date) - this._timestamp(b.date));
    const invalid = current.filter((event) => !isValidDate(event.date));
    const ordered = [...valid, ...invalid];

    if (ordered.some((event, index) => current[index] !== event)) {
      this._reorderingEvents = true;
      for (const event of ordered) {
        this.append(event);
      }
      queueMicrotask(() => {
        this._reorderingEvents = false;
      });
    }

    this._events = valid;
    this._managedEvents = ordered;
    for (const event of ordered) {
      this._snapshotEvent(event);
      event.setAttribute('data-timeline-managed', '');
      if (!valid.includes(event)) {
        event.tabIndex = -1;
      }
      this._eventMutationObserver.observe(event, {
        attributes: true,
        attributeFilter: ['date'],
      });
      this._eventResizeObserver.observe(event);
    }

    this._refreshEventAttributes();
    this._refreshRovingTabindex(focused);
    if (
      focused &&
      activeElement instanceof HTMLElement &&
      this._composedContains(focused, activeElement)
    ) {
      activeElement.focus({ preventScroll: true });
    }
    this._scheduleLayout();
  }

  private _deepestActiveElement(): Element | null {
    let active: Element | null = document.activeElement;
    while (active instanceof HTMLElement && active.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  private _composedContains(event: TimelineEvent, target: Element | null): boolean {
    let current: Node | null = target;
    while (current) {
      if (current === event) {
        return true;
      }
      const root = current.getRootNode();
      current = current.parentNode ?? (root instanceof ShadowRoot ? root.host : null);
    }
    return false;
  }

  private _snapshotEvent(event: TimelineEvent): void {
    if (this._eventSnapshots.has(event)) {
      return;
    }
    const styles: ManagedEventSnapshot['styles'] = {};
    for (const property of OWNED_EVENT_STYLE_PROPERTIES) {
      styles[property] = {
        value: event.style.getPropertyValue(property),
        priority: event.style.getPropertyPriority(property),
      };
    }
    this._eventSnapshots.set(event, {
      role: event.getAttribute('role'),
      tabindex: event.getAttribute('tabindex'),
      styles,
    });
  }

  private _restoreStandaloneEvent(event: TimelineEvent): void {
    const snapshot = this._eventSnapshots.get(event);
    event.removeAttribute('data-timeline-managed');
    event.removeAttribute('data-layout-mode');
    event.removeAttribute('data-layout-ready');
    if (!snapshot) {
      return;
    }
    for (const [attribute, value] of [
      ['role', snapshot.role],
      ['tabindex', snapshot.tabindex],
    ] as const) {
      if (value === null) {
        event.removeAttribute(attribute);
      } else {
        event.setAttribute(attribute, value);
      }
    }
    for (const property of OWNED_EVENT_STYLE_PROPERTIES) {
      const { value, priority } = snapshot.styles[property];
      if (value) {
        event.style.setProperty(property, value, priority);
      } else {
        event.style.removeProperty(property);
      }
    }
    if (!event.getAttribute('style')) {
      event.removeAttribute('style');
    }
    this._eventSnapshots.delete(event);
  }

  private _mode(): 'horizontal' | 'vertical' | 'list' {
    return this.list ? 'list' : this.vertical ? 'vertical' : 'horizontal';
  }

  private _refreshEventAttributes(): void {
    const mode = this._mode();
    for (const event of this._getDirectEvents()) {
      event.setAttribute('data-layout-mode', mode);
      if (this.list) {
        event.setAttribute('role', 'listitem');
      } else {
        const role = this._eventSnapshots.get(event)?.role;
        if (role === null || role === undefined) {
          event.removeAttribute('role');
        } else {
          event.setAttribute('role', role);
        }
      }
    }
  }

  private _refreshRovingTabindex(preferred?: TimelineEvent): void {
    const active = preferred && this._events.includes(preferred) ? preferred : this._events[0];
    this._activeEventIndex = Math.max(0, active ? this._events.indexOf(active) : 0);
    this._events.forEach((event, index) => {
      event.tabIndex = index === this._activeEventIndex ? 0 : -1;
    });
  }

  private _directEventFromPath(path: EventTarget[]): TimelineEvent | undefined {
    return path.find(
      (target): target is TimelineEvent =>
        target instanceof HTMLElement && this._events.includes(target as TimelineEvent)
    );
  }

  private _handleFocusIn = (event: FocusEvent): void => {
    const focused = this._directEventFromPath(event.composedPath());
    if (!focused) {
      return;
    }
    this._activeEventIndex = this._events.indexOf(focused);
    this._events.forEach((item) => {
      item.tabIndex = item === focused ? 0 : -1;
    });
  };

  private _handleKeyDown = (event: KeyboardEvent): void => {
    const focused = this._directEventFromPath(event.composedPath());
    if (!focused || this._events.length === 0) {
      return;
    }

    const currentIndex = this._events.indexOf(focused);
    let nextIndex = currentIndex;
    const horizontal = !this.vertical && !this.list;

    switch (event.key) {
      case 'ArrowRight':
        if (horizontal) {
          nextIndex = Math.min(currentIndex + 1, this._events.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (horizontal) {
          nextIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case 'ArrowDown':
        if (!horizontal) {
          nextIndex = Math.min(currentIndex + 1, this._events.length - 1);
        }
        break;
      case 'ArrowUp':
        if (!horizontal) {
          nextIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = this._events.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      this._setActiveEvent(nextIndex);
    }
  };

  private _setActiveEvent(index: number): void {
    this._activeEventIndex = index;
    this._events.forEach((event, eventIndex) => {
      event.tabIndex = eventIndex === index ? 0 : -1;
    });
    const active = this._events[index];
    active.focus();
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  private _scheduleLayout(): void {
    if (this._layoutScheduled || !this.isConnected) {
      return;
    }
    this._layoutScheduled = true;
    requestAnimationFrame(() => {
      this._layoutScheduled = false;
      if (this.isConnected) {
        this._calculateLayout();
      }
    });
  }

  private _resetOwnedLayout(): HTMLElement | null {
    const container = this.shadowRoot?.querySelector<HTMLElement>('.timeline-container');
    if (!container) {
      return null;
    }
    container.style.minWidth = '';
    container.style.minHeight = '';
    container.style.width = '';
    container.style.height = '';
    for (const event of this._getDirectEvents()) {
      event.removeAttribute('data-layout-ready');
      event.style.position = '';
      event.style.left = '';
      event.style.top = '';
      event.style.maxWidth = '';
      event.style.visibility = '';
    }
    return container;
  }

  private _clearLayout(container?: HTMLElement): void {
    if (container) {
      container.style.minWidth = '';
      container.style.minHeight = '';
      container.style.width = '';
      container.style.height = '';
    }
    this._eventLayouts = [];
    this._svgData = { ...EMPTY_SVG_DATA };
    for (const event of this._getDirectEvents()) {
      event.removeAttribute('data-layout-ready');
    }
  }

  private _calculateLayout(): void {
    const container = this._resetOwnedLayout();
    if (!container) {
      return;
    }
    this._refreshEventAttributes();

    if (this._events.length === 0) {
      this._clearLayout(container);
      return;
    }

    if (this.list) {
      this._calculateListLayout(container);
    } else if (this.vertical) {
      this._calculateVerticalLayout(container);
    } else {
      this._calculateHorizontalLayout(container);
    }
  }

  private _calculateListLayout(container: HTMLElement): void {
    const layouts = this._measuredEvents();
    this._eventLayouts = layouts.map((event) => ({ ...event, x: 0, y: 0 }));
    this._svgData = { ...EMPTY_SVG_DATA };
    for (const event of this._events) {
      event.style.position = 'relative';
      event.style.visibility = 'visible';
      event.setAttribute('data-layout-ready', '');
    }
    container.style.height = '';
  }

  private _measuredEvents(): DateRangeData['sortedEvents'] {
    return this._events.map((el) => ({
      el,
      date: el.date,
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));
  }

  private _timestamp(date: string): number {
    return new Date(`${date}T12:00:00Z`).getTime();
  }

  private _getDateRangeAndEvents(): DateRangeData | null {
    const sortedEvents = this._measuredEvents();
    if (sortedEvents.length === 0) {
      return null;
    }

    const timestamps = sortedEvents.map((event) => this._timestamp(event.date));
    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const startDate = new Date(
      Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth() - 2, 1, 12)
    );
    const endDate = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth() + 3, 0, 12));

    if (this.startYear !== undefined) {
      startDate.setTime(Date.UTC(this.startYear, 0, 1, 12));
    }
    if (this.endYear !== undefined) {
      endDate.setTime(Date.UTC(this.endYear, 11, 31, 12));
    }

    if (startDate.getTime() > endDate.getTime()) {
      const warning = `[timeline-component] Invalid range ${this.startYear}–${this.endYear}; start-year must not exceed end-year.`;
      if (!this._warnedRanges.has(warning)) {
        this._warnedRanges.add(warning);
        console.warn(warning);
      }
      return null;
    }

    return { startDate, endDate, sortedEvents };
  }

  private _calculateHorizontalLayout(container: HTMLElement): void {
    const data = this._getDateRangeAndEvents();
    if (!data) {
      this._clearLayout(container);
      return;
    }

    const maxCardWidth = Math.max(...data.sortedEvents.map((event) => event.width));
    const margin = Math.max(60, maxCardWidth / 2 + 30);
    const wrapperWidth = container.parentElement?.clientWidth || container.clientWidth;
    const contentWidth = Math.max(wrapperWidth, this.MIN_CONTENT_DIM, margin * 2 + 1);
    container.style.minWidth = `${contentWidth}px`;

    const duration = data.endDate.getTime() - data.startDate.getTime();
    const dateToX = (date: string): number =>
      margin +
      ((this._timestamp(date) - data.startDate.getTime()) / duration) * (contentWidth - 2 * margin);

    const rowEnds: number[] = [];
    const rowGap =
      parseFloat(getComputedStyle(this).getPropertyValue('--timeline-h-row-gap')) || 330;
    const layouts: EventLayout[] = [];
    for (const event of data.sortedEvents) {
      const x = Math.max(0, dateToX(event.date) - event.width / 2);
      let row = rowEnds.findIndex((end) => x > end);
      if (row === -1) {
        row = rowEnds.length;
      }
      layouts.push({ ...event, x, y: 20 + row * rowGap });
      rowEnds[row] = x + event.width + 30;
    }

    const eventBottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
    const axisY = eventBottom + 60;
    const requiredHeight = axisY + 45;
    container.style.height = `${requiredHeight}px`;

    this._eventLayouts = layouts;
    this._svgData = {
      axisPath: `M ${margin},${axisY} H ${contentWidth - margin}`,
      connectors: layouts.map(
        (layout) => `M ${dateToX(layout.date)},${layout.y + layout.height} V ${axisY}`
      ),
      dots: layouts.map((layout) => ({ cx: dateToX(layout.date), cy: axisY })),
      markers: this._generateMarkers(data.startDate, data.endDate, duration, dateToX, axisY, false),
    };
    this._applyLayouts(layouts, false);
  }

  private _calculateVerticalLayout(container: HTMLElement): void {
    const containerWidth = container.parentElement?.clientWidth || container.clientWidth;
    const mobile = containerWidth < 600;
    const initialData = this._getDateRangeAndEvents();
    if (!initialData) {
      this._clearLayout(container);
      return;
    }

    let mobileAxisX = 0;
    let mobileCardX = 0;
    if (mobile) {
      const initialDuration = initialData.endDate.getTime() - initialData.startDate.getTime();
      const markerEntries = this._generateMarkerEntries(
        initialData.startDate,
        initialData.endDate,
        initialDuration
      );
      mobileAxisX = Math.max(30, Math.ceil(this._measureMarkerLabelWidth(markerEntries)) + 24);
      mobileCardX = mobileAxisX + 30;
      const availableMobileWidth = Math.max(0, containerWidth - mobileCardX - 16);
      for (const event of this._events) {
        event.style.maxWidth = `${availableMobileWidth}px`;
      }
    }

    // Apply responsive constraints before using card geometry so wrapped heights are current.
    const data = mobile ? this._getDateRangeAndEvents() : initialData;
    if (!data) {
      this._clearLayout(container);
      return;
    }

    const maxCardHeight = Math.max(...data.sortedEvents.map((event) => event.height));
    const margin = Math.max(60, maxCardHeight / 2 + 30);
    const axisContentHeight = Math.max(this.MIN_CONTENT_DIM, margin * 2 + 1);
    const duration = data.endDate.getTime() - data.startDate.getTime();
    const dateToY = (date: string): number =>
      margin +
      ((this._timestamp(date) - data.startDate.getTime()) / duration) *
        (axisContentHeight - 2 * margin);
    const axisX = mobile ? mobileAxisX : containerWidth / 2;
    const gap =
      parseFloat(getComputedStyle(this).getPropertyValue('--timeline-v-column-gap')) || 100;
    const sideBottom: Record<'left' | 'right', number> = { left: -30, right: -30 };

    const layouts: EventLayout[] = data.sortedEvents.map((event, index) => {
      const side: 'left' | 'right' = mobile || index % 2 === 1 ? 'right' : 'left';
      const x = mobile
        ? mobileCardX
        : side === 'left'
          ? Math.max(0, axisX - gap - event.width)
          : axisX + gap;
      const idealY = Math.max(0, dateToY(event.date) - event.height / 2);
      const y = Math.max(idealY, sideBottom[side] + 30);
      sideBottom[side] = y + event.height;
      return { ...event, x, y, side };
    });

    const requiredWidth = Math.max(
      containerWidth,
      ...layouts.map((layout) => layout.x + layout.width)
    );
    if (requiredWidth > containerWidth) {
      container.style.minWidth = `${requiredWidth}px`;
    }
    const contentHeight = Math.max(
      axisContentHeight,
      ...layouts.map((layout) => layout.y + layout.height + 30)
    );
    container.style.minHeight = `${contentHeight}px`;

    this._eventLayouts = layouts;
    this._svgData = {
      axisPath: `M ${axisX},${margin} V ${axisContentHeight - margin}`,
      connectors: layouts.map((layout) => {
        const edgeX = layout.side === 'left' ? layout.x + layout.width : layout.x;
        return `M ${edgeX},${layout.y + layout.height / 2} L ${axisX},${dateToY(layout.date)}`;
      }),
      dots: layouts.map((layout) => ({ cx: axisX, cy: dateToY(layout.date) })),
      markers: this._generateMarkers(data.startDate, data.endDate, duration, dateToY, axisX, true),
    };
    this._applyLayouts(layouts, false);
  }

  private _applyLayouts(layouts: EventLayout[], list: boolean): void {
    for (const layout of layouts) {
      layout.el.style.position = list ? 'relative' : 'absolute';
      layout.el.style.left = list ? '' : `${layout.x}px`;
      layout.el.style.top = list ? '' : `${layout.y}px`;
      layout.el.style.visibility = 'visible';
      layout.el.setAttribute('data-layout-ready', '');
    }
  }

  private _generateMarkerEntries(
    startDate: Date,
    endDate: Date,
    totalDurationMs: number
  ): MarkerEntry[] {
    const entries: MarkerEntry[] = [];
    const twoYearsInMs = 2 * 365.25 * 24 * 60 * 60 * 1000;

    if (totalDurationMs <= twoYearsInMs) {
      const currentMonth = new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1, 12)
      );
      while (currentMonth <= endDate) {
        entries.push({
          date: currentMonth.toISOString().slice(0, 10),
          content: currentMonth.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
            timeZone: 'UTC',
          }),
        });
        currentMonth.setUTCMonth(currentMonth.getUTCMonth() + 1);
      }
    } else {
      for (let year = startDate.getUTCFullYear(); year <= endDate.getUTCFullYear(); year++) {
        if (year % 5 === 0) {
          entries.push({ date: `${year}-01-01`, content: year });
        }
      }
    }
    return entries;
  }

  private _measureMarkerLabelWidth(entries: MarkerEntry[]): number {
    const svgLayer = this.shadowRoot?.querySelector<SVGSVGElement>('.svg-layer');
    if (!svgLayer) {
      return 0;
    }
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    probe.classList.add('marker-text');
    probe.style.visibility = 'hidden';
    svgLayer.append(probe);

    let maxWidth = 0;
    for (const entry of entries) {
      probe.textContent = String(entry.content);
      maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
    }
    probe.remove();
    return maxWidth;
  }

  private _generateMarkers(
    startDate: Date,
    endDate: Date,
    totalDurationMs: number,
    posFunc: (date: string) => number,
    axisPos: number,
    isVertical: boolean
  ): MarkerData[] {
    return this._generateMarkerEntries(startDate, endDate, totalDurationMs).map((entry) => {
      const pos = posFunc(entry.date);
      return isVertical
        ? {
            line: { x1: axisPos - 10, y1: pos, x2: axisPos + 10, y2: pos },
            text: { content: entry.content, x: axisPos - 20, y: pos + 4, anchor: 'end' },
          }
        : {
            line: { x1: pos, y1: axisPos - 10, x2: pos, y2: axisPos + 10 },
            text: { content: entry.content, x: pos, y: axisPos + 25, anchor: 'middle' },
          };
    });
  }

  override render() {
    const dotRadius = getComputedStyle(this).getPropertyValue('--timeline-dot-size') || '5';
    return html`
      <div
        class="scroll-wrapper${this.list ? ' list-mode' : ''}"
        part="scroll-wrapper"
        role="region"
        aria-label=${this.label.trim() || 'Timeline'}
        tabindex="0"
      >
        <div
          class="timeline-container${this.list ? ' list-view' : ''}"
          part="container"
          data-layout-mode=${this._mode()}
          data-layout-ready=${this._eventLayouts.length > 0 ? 'true' : 'false'}
        >
          <slot
            id="timeline-events"
            role=${this.list ? 'list' : 'presentation'}
            @slotchange=${this._handleSlotChange}
          ></slot>
          ${this.list
            ? ''
            : html`<svg class="svg-layer" part="svg-layer" aria-hidden="true">
                ${this._svgData.axisPath
                  ? svg`<path
                      d=${this._svgData.axisPath}
                      stroke="var(--timeline-axis-color)"
                      stroke-width="var(--timeline-axis-width, 2)"
                      part="axis-line"
                    ></path>`
                  : ''}
                ${this._svgData.connectors.map(
                  (pathData) => svg`<path
                    d=${pathData}
                    stroke="var(--timeline-connector-color)"
                    stroke-width="var(--timeline-connector-width, 2)"
                    fill="none"
                    part="connector-line"
                  ></path>`
                )}
                ${this._svgData.markers.map(
                  (marker) => svg`
                    <line
                      x1=${marker.line.x1}
                      y1=${marker.line.y1}
                      x2=${marker.line.x2}
                      y2=${marker.line.y2}
                      stroke="var(--timeline-marker-color)"
                      stroke-width="2"
                      part="marker-tick"
                    ></line>
                    <text
                      class="marker-text"
                      x=${marker.text.x}
                      y=${marker.text.y}
                      text-anchor=${marker.text.anchor}
                      part="marker-text"
                    >${marker.text.content}</text>
                  `
                )}
                ${this._svgData.dots.map(
                  (dot) => svg`<circle
                    cx=${dot.cx}
                    cy=${dot.cy}
                    r=${dotRadius}
                    fill="var(--timeline-dot-color)"
                    part="dot"
                  ></circle>`
                )}
              </svg>`}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'timeline-component': TimelineComponent;
  }
}
