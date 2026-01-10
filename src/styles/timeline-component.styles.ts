import { css } from 'lit';

export const timelineComponentStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .scroll-wrapper {
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--timeline-scrollbar-thumb-color, #47476b)
      var(--timeline-scrollbar-track-color, transparent);
  }

  .scroll-wrapper::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  .scroll-wrapper::-webkit-scrollbar-track {
    background: var(--timeline-scrollbar-track-color, transparent);
  }

  .scroll-wrapper::-webkit-scrollbar-thumb {
    background-color: var(--timeline-scrollbar-thumb-color, #47476b);
    border-radius: 10px;
  }

  .timeline-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100px;
  }

  .svg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    z-index: 1;
  }

  .marker-text {
    fill: var(--timeline-marker-text-color, #a4a4c1);
    font-size: var(--timeline-marker-font-size, 0.9rem);
  }
`;
