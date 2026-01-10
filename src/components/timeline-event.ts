import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { timelineEventStyles } from '../styles/timeline-event.styles.js';
import { formatDate } from '../utils/date-utils.js';

/**
 * A timeline event card component that displays a single event with an optional image.
 *
 * @slot - Default slot for event content (typically h3 and p elements)
 *
 * @csspart card - The main card container
 * @csspart image - The event image element
 * @csspart image-placeholder - The placeholder shown when no image is provided
 * @csspart content - The content container below the image
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
 */
@customElement('timeline-event')
export class TimelineEvent extends LitElement {
  static override styles = timelineEventStyles;

  /**
   * The date of the event in YYYY-MM-DD format
   */
  @property({ type: String })
  date = '';

  /**
   * URL for the event image. If not provided, a placeholder is shown.
   */
  @property({ type: String, attribute: 'image-src' })
  imageSrc = '';

  override connectedCallback(): void {
    super.connectedCallback();
    // Make the element focusable for accessibility
    this.setAttribute('tabindex', '0');
  }

  override render() {
    const formattedDate = formatDate(this.date);
    // Extract title from h3 element or create fallback title
    const h3Element = this.querySelector('h3');
    const titleText = h3Element?.textContent || `Event on ${formattedDate}`;

    return html`
      <div class="card" part="card" role="article" aria-label="${titleText}">
        <!-- Visually hidden date for screen readers -->
        <span class="visually-hidden">Date: ${formattedDate}</span>

        ${this.imageSrc
          ? html`<img src="${this.imageSrc}" alt="Image for ${titleText}" part="image" />`
          : html`<div
              class="image-placeholder"
              role="img"
              aria-label="Placeholder image for ${titleText}"
              part="image-placeholder"
            >
              Timeline event for ${this.date}
            </div>`}

        <div class="content" part="content">
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
