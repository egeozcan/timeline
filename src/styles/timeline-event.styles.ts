import { css } from 'lit';

export const timelineEventStyles = css`
  :host {
    display: block;
    position: absolute;
    width: var(--timeline-event-width, 250px);
    visibility: hidden;
    z-index: 2;
    outline-offset: var(--timeline-event-focus-offset, 4px);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* List view - when position is relative (set by parent) */
  :host([style*='position: relative']) {
    width: 100%;
    max-width: var(--timeline-list-event-max-width, 600px);
  }

  :host(:hover),
  :host(:focus-within) {
    z-index: 10;
    transform: scale(1.03);
  }

  .card {
    overflow: hidden;
    box-sizing: border-box;
  }

  img,
  .image-placeholder {
    width: 100%;
    height: var(--timeline-event-image-height, 140px);
    object-fit: cover;
    display: block;
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9em;
  }

  .content {
    padding: var(--timeline-event-content-padding, 20px);
    min-height: var(--timeline-event-content-min-height, 125px);
    box-sizing: border-box;
  }

  .date-display {
    display: none;
    font-size: var(--timeline-event-date-font-size, 0.85rem);
    font-weight: var(--timeline-event-date-font-weight, 500);
    margin-bottom: 8px;
    opacity: 0.7;
  }

  /* Show date in list mode */
  :host([style*='position: relative']) .date-display {
    display: block;
  }

  ::slotted(h3) {
    font-size: var(--timeline-event-heading-font-size, 1.1rem);
    font-weight: var(--timeline-event-heading-font-weight, 700);
    margin: 0 0 8px 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  ::slotted(p) {
    font-size: var(--timeline-event-text-font-size, 0.9rem);
    line-height: 1.5;
    margin: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
