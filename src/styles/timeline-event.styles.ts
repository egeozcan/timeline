import { css } from 'lit';

export const timelineEventStyles = css`
  :host {
    display: block;
    position: relative;
    width: var(--timeline-event-width, 250px);
    visibility: visible;
    z-index: 2;
    outline-offset: var(--timeline-event-focus-offset, 4px);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  :host([data-timeline-managed]) {
    position: absolute;
    visibility: hidden;
  }

  :host([data-timeline-managed][data-layout-ready]),
  :host([data-layout-mode='list']) {
    visibility: visible;
  }

  :host([data-invalid-date]) {
    display: none;
  }

  :host([data-layout-mode='list']) {
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
    background: var(--timeline-event-bg-color, #2c2c54);
    border: 1px solid var(--timeline-event-border-color, #47476b);
    border-radius: var(--timeline-event-border-radius, 16px);
    box-shadow: var(--timeline-event-shadow, 0 10px 30px rgba(0, 0, 0, 0.3));
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
    background: var(--timeline-event-placeholder-bg, #3a3a66);
    color: var(--timeline-event-placeholder-color, #8c8caf);
  }

  .content {
    padding: var(--timeline-event-content-padding, 20px);
    min-height: var(--timeline-event-content-min-height, 125px);
    box-sizing: border-box;
  }

  .date-display {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    font-size: var(--timeline-event-date-font-size, 0.85rem);
    font-weight: var(--timeline-event-date-font-weight, 500);
  }

  :host([data-layout-mode='list']) .date-display {
    position: static;
    width: auto;
    height: auto;
    margin: 0 0 8px;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }

  ::slotted(h3) {
    color: var(--timeline-event-heading-color, #ffffff);
    font-size: var(--timeline-event-heading-font-size, 1.1rem);
    font-weight: var(--timeline-event-heading-font-weight, 700);
    margin: 0 0 8px 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  ::slotted(p) {
    color: var(--timeline-event-text-color, #a4a4c1);
    font-size: var(--timeline-event-text-font-size, 0.9rem);
    line-height: 1.5;
    margin: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
`;
