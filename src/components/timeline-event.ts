import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { timelineEventStyles } from '../styles/timeline-event.styles.js';
import { formatDate, isValidDate } from '../utils/date-utils.js';

/**
 * A timeline event card component that displays a single event with an optional image.
 *
 * @slot - Default slot for event content (typically h3 and p elements)
 *
 * @csspart card - The main card container
 * @csspart image - The event image element
 * @csspart image-placeholder - The placeholder shown when no image is provided
 * @csspart content - The content container below the image
 * @csspart date - The date display element (visible in list mode)
 *
 * @cssprop [--timeline-event-width=250px] - Width of the event card
 * @cssprop [--timeline-event-bg-color=#2c2c54] - Background color of the card
 * @cssprop [--timeline-event-border-color=#47476b] - Border color of the card
 * @cssprop [--timeline-event-border-radius=16px] - Border radius of the card
 * @cssprop [--timeline-event-shadow=0 10px 30px rgba(0,0,0,0.3)] - Box shadow of the card
 * @cssprop [--timeline-event-image-height=140px] - Height of the image area
 * @cssprop [--timeline-event-content-padding=20px] - Padding inside the content area
 * @cssprop [--timeline-event-content-min-height=125px] - Minimum height of content area
 * @cssprop [--timeline-event-heading-color=#ffffff] - Color of the heading text
 * @cssprop [--timeline-event-heading-font-size=1.1rem] - Font size of the heading
 * @cssprop [--timeline-event-heading-font-weight=700] - Font weight of the heading
 * @cssprop [--timeline-event-text-color=#a4a4c1] - Color of the description text
 * @cssprop [--timeline-event-text-font-size=0.9rem] - Font size of the description
 * @cssprop [--timeline-event-placeholder-bg=#3a3a66] - Background of image placeholder
 * @cssprop [--timeline-event-placeholder-color=#8c8caf] - Text color of placeholder
 * @cssprop [--timeline-event-focus-offset=4px] - Focus outline offset
 * @cssprop [--timeline-event-date-color=currentColor] - Color of the date display
 * @cssprop [--timeline-event-date-font-size=0.85rem] - Font size of the date display
 * @cssprop [--timeline-event-date-font-weight=500] - Font weight of the date display
 * @cssprop [--timeline-list-event-max-width=600px] - Maximum width of event cards in list mode
 */
@customElement('timeline-event')
export class TimelineEvent extends LitElement {
  static override styles = timelineEventStyles;

  /**
   * The date of the event in YYYY-MM-DD format
   */
  @property({ type: String, reflect: true })
  date = '';

  /**
   * URL for the event image. If not provided, a placeholder is shown.
   */
  @property({ type: String, attribute: 'image-src' })
  imageSrc = '';

  /**
   * Alternative text for the event image. Empty text marks the image as decorative.
   */
  @property({ type: String, attribute: 'image-alt', reflect: true })
  imageAlt = '';

  private _contentObserver?: MutationObserver;
  private readonly _warnedInvalidDates = new Set<string>();
  // The host is the focus target, so the article role and its label belong here rather than on
  // the inner card. ElementInternals supplies them as *defaults*, which an author-supplied
  // `role` attribute (or the parent's `listitem`) still overrides. Optional because
  // attachInternals predates Safari 16.4; on older engines the card simply has no role.
  private readonly _internals = this.attachInternals?.();

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = 0;
    }

    this._contentObserver ??= new MutationObserver(() => this.requestUpdate());
    this._contentObserver.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  override disconnectedCallback(): void {
    this._contentObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<TimelineEvent>): void {
    if (this._internals) {
      this._internals.role = 'article';
      this._internals.ariaLabel = this._titleText();
    }

    if (!changedProperties.has('date')) {
      return;
    }

    const invalid = !isValidDate(this.date);
    this.toggleAttribute('data-invalid-date', invalid);
    if (invalid && !this._warnedInvalidDates.has(this.date)) {
      this._warnedInvalidDates.add(this.date);
      console.warn(`[timeline-event] Invalid date "${this.date}"; expected YYYY-MM-DD.`);
    }
  }

  /** Accessible name for the card: the slotted heading, or a date-derived fallback. */
  private _titleText(): string {
    const heading = this.querySelector('h3')?.textContent?.trim();
    return heading || `Event on ${formatDate(this.date)}`;
  }

  override render() {
    const formattedDate = formatDate(this.date);

    return html`
      <div class="card" part="card">
        ${this.imageSrc
          ? html`<img src=${this.imageSrc} alt=${this.imageAlt} part="image" />`
          : html`<div class="image-placeholder" aria-hidden="true" part="image-placeholder">
              Timeline event for ${this.date}
            </div>`}

        <div class="content" part="content">
          <time class="date-display" datetime=${this.date} part="date">${formattedDate}</time>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'timeline-event': TimelineEvent;
  }
}
