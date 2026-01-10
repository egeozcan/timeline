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

  :host(:hover),
  :host(:focus-within) {
    z-index: 10;
    transform: scale(1.03);
  }

  .card {
    background-color: var(--timeline-event-bg-color, #2c2c54);
    border-radius: var(--timeline-event-border-radius, 16px);
    border: 1px solid var(--timeline-event-border-color, #47476b);
    box-shadow: var(--timeline-event-shadow, 0 10px 30px rgba(0, 0, 0, 0.3));
    overflow: hidden;
  }

  img,
  .image-placeholder {
    width: 100%;
    height: var(--timeline-event-image-height, 140px);
    object-fit: cover;
    display: block;
    background-color: var(--timeline-event-placeholder-bg, #3a3a66);
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--timeline-event-placeholder-color, #b8b8d0);
    font-size: 0.9em;
  }

  .content {
    padding: var(--timeline-event-content-padding, 20px);
    min-height: var(--timeline-event-content-min-height, 125px);
    box-sizing: border-box;
  }

  ::slotted(h3) {
    font-size: var(--timeline-event-heading-font-size, 1.1rem);
    font-weight: var(--timeline-event-heading-font-weight, 700);
    color: var(--timeline-event-heading-color, #ffffff);
    margin: 0 0 8px 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  ::slotted(p) {
    font-size: var(--timeline-event-text-font-size, 0.9rem);
    line-height: 1.5;
    color: var(--timeline-event-text-color, #a4a4c1);
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
