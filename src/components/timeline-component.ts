import { LitElement, html, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { timelineComponentStyles } from '../styles/timeline-component.styles.js';
import type { EventLayout, SVGData, MarkerData } from '../types/index.js';
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
 * @cssprop [--timeline-dot-size=5] - Radius of event dots
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

  /**
   * Override the start year for the timeline range.
   * If not set, it will be auto-detected from events.
   */
  @property({ type: Number, attribute: 'start-year' })
  startYear?: number;

  /**
   * Override the end year for the timeline range.
   * If not set, it will be auto-detected from events.
   */
  @property({ type: Number, attribute: 'end-year' })
  endYear?: number;

  /**
   * Display the timeline vertically instead of horizontally.
   */
  @property({ type: Boolean })
  vertical = false;

  /**
   * Display events in a simple list format without timeline axis.
   * Overrides vertical/horizontal layout when enabled.
   */
  @property({ type: Boolean })
  list = false;

  /**
   * Accessible label for the timeline region.
   */
  @property({ type: String })
  label = '';

  @state()
  private _eventLayouts: EventLayout[] = [];

  @state()
  private _svgData: SVGData = {
    axisPath: '',
    connectors: [],
    dots: [],
    markers: [],
  };

  private _resizeObserver = new ResizeObserver(() => this._calculateLayout());
  private readonly MIN_CONTENT_DIM = 1800;
  private _activeEventIndex = 0;
  private _boundKeyHandler = this._handleKeyDown.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._boundKeyHandler);
  }

  override disconnectedCallback(): void {
    this._resizeObserver.disconnect();
    this.removeEventListener('keydown', this._boundKeyHandler);
    super.disconnectedCallback();
  }

  override async firstUpdated(): Promise<void> {
    // Move observer setup to firstUpdated to ensure element exists
    const scrollWrapper = this.shadowRoot?.querySelector('.scroll-wrapper');
    if (scrollWrapper) {
      this._resizeObserver.observe(scrollWrapper);
    }
    // Wait for next frame to ensure DOM is ready
    await new Promise((resolve) => setTimeout(resolve, 0));
    this._calculateLayout();
    this._initRovingTabindex();
  }

  /**
   * Initialize roving tabindex pattern for keyboard navigation
   */
  private _initRovingTabindex(): void {
    const events = this._getEventElements();
    events.forEach((event, index) => {
      event.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    this._activeEventIndex = 0;
  }

  /**
   * Get all timeline-event children sorted by date
   */
  private _getEventElements(): HTMLElement[] {
    return Array.from(this.querySelectorAll('timeline-event')) as HTMLElement[];
  }

  /**
   * Handle keyboard navigation for roving tabindex
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    const events = this._getEventElements();
    if (events.length === 0) {
      return;
    }

    // Only handle if focus is on a timeline-event
    const focusedEvent = document.activeElement;
    if (!focusedEvent || focusedEvent.tagName.toLowerCase() !== 'timeline-event') {
      return;
    }

    const currentIndex = events.indexOf(focusedEvent as HTMLElement);
    if (currentIndex === -1) {
      return;
    }

    let newIndex = currentIndex;
    const isHorizontal = !this.vertical && !this.list;
    const isVerticalNav = this.vertical || this.list;

    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          newIndex = Math.min(currentIndex + 1, events.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          newIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case 'ArrowDown':
        if (isVerticalNav) {
          newIndex = Math.min(currentIndex + 1, events.length - 1);
        }
        break;
      case 'ArrowUp':
        if (isVerticalNav) {
          newIndex = Math.max(currentIndex - 1, 0);
        }
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = events.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      this._setActiveEvent(events, newIndex);
    }
  }

  /**
   * Set the active event for roving tabindex
   */
  private _setActiveEvent(events: HTMLElement[], index: number): void {
    // Remove tabindex from current active
    events[this._activeEventIndex]?.setAttribute('tabindex', '-1');

    // Set new active
    this._activeEventIndex = index;
    const newActive = events[index];
    newActive.setAttribute('tabindex', '0');
    newActive.focus();

    // Scroll the event into view if needed
    newActive.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  private _calculateLayout(): void {
    if (this.list) {
      this._calculateListLayout();
    } else if (this.vertical) {
      this._calculateVerticalLayout();
    } else {
      this._calculateHorizontalLayout();
    }
  }

  private _calculateListLayout(): void {
    const container = this.shadowRoot?.querySelector('.timeline-container') as HTMLElement;
    if (!container) {
      return;
    }

    // Reset container sizing for list mode
    container.style.minWidth = '';
    container.style.minHeight = '';
    container.style.height = '';
    container.style.width = '';

    const events = Array.from(this.querySelectorAll('timeline-event'));
    if (events.length === 0) {
      return;
    }

    // Sort events by date
    const sortedEvents = events
      .map((el) => ({
        el,
        date: el.date,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    // In list mode, we just need to track events for keyboard navigation
    // Positioning is handled by CSS flexbox/grid
    this._eventLayouts = sortedEvents.map((event) => ({
      ...event,
      x: 0,
      y: 0,
    }));

    // Clear SVG data for list mode (no axis/connectors)
    this._svgData = {
      axisPath: '',
      connectors: [],
      dots: [],
      markers: [],
    };
  }

  /**
   * Get date range and collect all timeline events
   */
  private _getDateRangeAndEvents(): DateRangeData | null {
    const events = Array.from(this.querySelectorAll('timeline-event'));
    if (events.length === 0) {
      return null;
    }

    let startDate: Date;
    let endDate: Date;

    // Use provided years or calculate from events
    if (this.startYear && this.endYear) {
      startDate = new Date(`${this.startYear}-01-01T12:00:00Z`);
      endDate = new Date(`${this.endYear}-12-31T12:00:00Z`);
    } else {
      // Extract dates from events and add padding
      const eventDates = events.map((e) => new Date(`${e.date}T12:00:00Z`));
      const minDate = new Date(Math.min(...eventDates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...eventDates.map((d) => d.getTime())));

      startDate = new Date(minDate);
      startDate.setMonth(startDate.getMonth() - 2);

      endDate = new Date(maxDate);
      endDate.setMonth(endDate.getMonth() + 2);
    }

    // Sort events by date and collect dimensions
    const sortedEvents = events
      .map((el) => ({
        el,
        date: el.date,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    return { startDate, endDate, sortedEvents };
  }

  private _calculateHorizontalLayout(): void {
    const container = this.shadowRoot?.querySelector('.timeline-container') as HTMLElement;
    if (!container) {
      return;
    }

    container.style.minWidth = `${this.MIN_CONTENT_DIM}px`;
    container.style.minHeight = '';

    const contentWidth = Math.max(container.offsetWidth, this.MIN_CONTENT_DIM);
    const data = this._getDateRangeAndEvents();
    if (!data) {
      return;
    }

    const { startDate, endDate, sortedEvents } = data;
    const totalDurationMs = endDate.getTime() - startDate.getTime();

    // Convert date to X position on timeline
    const dateToX = (dateStr: string): number => {
      const eventDate = new Date(`${dateStr}T12:00:00Z`).getTime();
      const progress = (eventDate - startDate.getTime()) / totalDurationMs;
      // Leave 60px margin on each side
      return 60 + progress * (contentWidth - 120);
    };

    const eventLayouts: EventLayout[] = [];
    const rowLastX: number[] = []; // Track last used position in each row
    // Vertical gap between rows (default 330px)
    const vGap = parseInt(getComputedStyle(this).getPropertyValue('--timeline-h-row-gap') || '330');

    // Position events to avoid overlap
    for (const event of sortedEvents) {
      const startX = dateToX(event.date) - event.width / 2;
      let placed = false;

      // Try to place in existing rows
      for (let i = 0; i < rowLastX.length; i++) {
        if (startX > rowLastX[i]) {
          eventLayouts.push({
            ...event,
            x: startX,
            y: 20 + i * vGap,
          });
          // Update last used position in this row
          rowLastX[i] = startX + event.width + 30;
          placed = true;
          break;
        }
      }

      // Create new row if needed
      if (!placed) {
        const i = rowLastX.length;
        eventLayouts.push({
          ...event,
          x: startX,
          y: 20 + i * vGap,
        });
        rowLastX.push(startX + event.width + 30);
      }
    }

    this._eventLayouts = eventLayouts;

    // Set container height based on number of rows
    const requiredHeight = 20 + rowLastX.length * vGap + 150;
    container.style.height = `${requiredHeight}px`;

    const axisY = requiredHeight - 60; // Position timeline axis

    // Generate timeline markers and SVG elements
    const markers = this._generateMarkers(
      startDate,
      endDate,
      totalDurationMs,
      dateToX,
      axisY,
      false
    );

    this._svgData = {
      axisPath: `M 60,${axisY} H ${contentWidth - 60}`,
      connectors: eventLayouts.map((l) => `M ${dateToX(l.date)},${l.y + l.height} V ${axisY}`),
      dots: eventLayouts.map((l) => ({
        cx: dateToX(l.date),
        cy: axisY,
      })),
      markers,
    };
  }

  private _calculateVerticalLayout(): void {
    const container = this.shadowRoot?.querySelector('.timeline-container') as HTMLElement;
    if (!container) {
      return;
    }

    container.style.minHeight = `${this.MIN_CONTENT_DIM}px`;
    container.style.minWidth = '';

    const contentHeight = Math.max(container.offsetHeight, this.MIN_CONTENT_DIM);
    const data = this._getDateRangeAndEvents();
    if (!data) {
      return;
    }

    const { startDate, endDate, sortedEvents } = data;
    const totalDurationMs = endDate.getTime() - startDate.getTime();

    // Convert date to Y position on timeline
    const dateToY = (dateStr: string): number => {
      const eventDate = new Date(`${dateStr}T12:00:00Z`).getTime();
      const progress = (eventDate - startDate.getTime()) / totalDurationMs;
      // Leave 60px margin on top and bottom
      return 60 + progress * (contentHeight - 120);
    };

    const eventLayouts: EventLayout[] = [];
    const columnLastY: number[] = []; // Track last used position in each column
    const axisX = container.offsetWidth / 2; // Center axis
    // Horizontal gap between columns (default 100px)
    const hGap = parseInt(
      getComputedStyle(this).getPropertyValue('--timeline-v-column-gap') || '100'
    );

    // Position events alternating left and right of timeline
    for (const event of sortedEvents) {
      const startY = dateToY(event.date) - event.height / 2;
      let placed = false;

      // Try to place in existing columns
      for (let i = 0; i < columnLastY.length; i++) {
        if (startY > (columnLastY[i] || 0)) {
          // Alternate sides: even indices = left, odd = right
          const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
          const col = Math.floor(i / 2); // Column number

          // Calculate X position based on side and column
          const x =
            side === 'left'
              ? axisX - hGap - event.width - col * (event.width + 15)
              : axisX + hGap + col * (event.width + 15);

          eventLayouts.push({
            ...event,
            x,
            y: startY,
            side,
          });

          // Update last used position in this column
          columnLastY[i] = startY + event.height + 15;
          placed = true;
          break;
        }
      }

      // Create new column if needed
      if (!placed) {
        const i = columnLastY.length;
        const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
        const col = Math.floor(i / 2);

        const x =
          side === 'left'
            ? axisX - hGap - event.width - col * (event.width + 15)
            : axisX + hGap + col * (event.width + 15);

        eventLayouts.push({
          ...event,
          x,
          y: startY,
          side,
        });

        columnLastY.push(startY + event.height + 15);
      }
    }

    this._eventLayouts = eventLayouts;
    container.style.width = `${container.offsetWidth}px`;

    // Generate timeline markers and SVG elements
    const markers = this._generateMarkers(
      startDate,
      endDate,
      totalDurationMs,
      dateToY,
      axisX,
      true
    );

    this._svgData = {
      axisPath: `M ${axisX},60 V ${contentHeight - 60}`,
      connectors: eventLayouts.map(
        (l) => `M ${l.side === 'left' ? l.x + l.width : l.x},${dateToY(l.date)} H ${axisX}`
      ),
      dots: eventLayouts.map((l) => ({
        cx: axisX,
        cy: dateToY(l.date),
      })),
      markers,
    };
  }

  /**
   * Generate timeline markers (months or years) based on time span
   */
  private _generateMarkers(
    startDate: Date,
    endDate: Date,
    totalDurationMs: number,
    posFunc: (dateStr: string) => number,
    axisPos: number,
    isVertical: boolean
  ): MarkerData[] {
    const markers: MarkerData[] = [];
    const twoYearsInMs = 2 * 365.25 * 24 * 60 * 60 * 1000;

    // Show monthly markers for timelines under 2 years
    if (totalDurationMs <= twoYearsInMs) {
      const currentMonth = new Date(startDate);
      currentMonth.setDate(1); // Start from first day of month

      while (currentMonth <= endDate) {
        const pos = posFunc(currentMonth.toISOString().slice(0, 10));
        const text = currentMonth.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });

        if (isVertical) {
          markers.push({
            line: { x1: axisPos - 10, y1: pos, x2: axisPos + 10, y2: pos },
            text: { content: text, x: axisPos - 20, y: pos + 4, anchor: 'end' },
          });
        } else {
          markers.push({
            line: { x1: pos, y1: axisPos - 10, x2: pos, y2: axisPos + 10 },
            text: { content: text, x: pos, y: axisPos + 25, anchor: 'middle' },
          });
        }

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    } else {
      // Show 5-year markers for longer timelines
      for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
        if (year % 5 === 0) {
          const pos = posFunc(`${year}-01-01`);

          if (isVertical) {
            markers.push({
              line: { x1: axisPos - 10, y1: pos, x2: axisPos + 10, y2: pos },
              text: { content: year, x: axisPos - 20, y: pos + 4, anchor: 'end' },
            });
          } else {
            markers.push({
              line: { x1: pos, y1: axisPos - 10, x2: pos, y2: axisPos + 10 },
              text: { content: year, x: pos, y: axisPos + 25, anchor: 'middle' },
            });
          }
        }
      }
    }

    return markers;
  }

  override render() {
    // Apply calculated positions to timeline events after render
    this.updateComplete.then(() => {
      if (this.list) {
        // In list mode, reset absolute positioning and make visible
        this._eventLayouts.forEach((layout) => {
          layout.el.style.position = 'relative';
          layout.el.style.left = '';
          layout.el.style.top = '';
          layout.el.style.visibility = 'visible';
        });
      } else {
        this._eventLayouts.forEach((layout) => {
          layout.el.style.position = 'absolute';
          layout.el.style.left = `${layout.x}px`;
          layout.el.style.top = `${layout.y}px`;
          layout.el.style.visibility = 'visible';
        });
      }
    });

    const dotRadius = getComputedStyle(this).getPropertyValue('--timeline-dot-size') || '5';
    const containerClass = this.list ? 'timeline-container list-view' : 'timeline-container';

    return html`
      <div
        class="scroll-wrapper${this.list ? ' list-mode' : ''}"
        part="scroll-wrapper"
        role="region"
        aria-label="${this.label}"
        tabindex="0"
      >
        <div class="${containerClass}" part="container">
          <slot></slot>

          ${this.list
            ? ''
            : html`<svg class="svg-layer" part="svg-layer" aria-hidden="true">
                <!-- Timeline axis -->
                <path
                  d="${this._svgData.axisPath}"
                  stroke="var(--timeline-axis-color)"
                  stroke-width="var(--timeline-axis-width, 2)"
                  part="axis-line"
                />

                <!-- Event connectors -->
                ${this._svgData.connectors.map(
                  (pathData) => svg`
              <path
                d="${pathData}"
                stroke="var(--timeline-connector-color)"
                stroke-width="var(--timeline-connector-width, 2)"
                fill="none"
                part="connector-line"
              ></path>
            `
                )}

                <!-- Timeline markers -->
                ${this._svgData.markers.map(
                  (m) => svg`
              <line
                x1="${m.line.x1}"
                y1="${m.line.y1}"
                x2="${m.line.x2}"
                y2="${m.line.y2}"
                stroke="var(--timeline-marker-color)"
                stroke-width="2"
                part="marker-tick"
              />
              <text
                class="marker-text"
                x="${m.text.x}"
                y="${m.text.y}"
                text-anchor="${m.text.anchor}"
                part="marker-text"
              >${m.text.content}</text>
            `
                )}

                <!-- Event dots -->
                ${this._svgData.dots.map(
                  (dot) => svg`
              <circle
                cx="${dot.cx}"
                cy="${dot.cy}"
                r="${dotRadius}"
                fill="var(--timeline-dot-color)"
                part="dot"
              />
            `
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
