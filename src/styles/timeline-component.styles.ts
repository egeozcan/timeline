import { css } from 'lit';

export const timelineComponentStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .scroll-wrapper {
    overflow: auto;
    scrollbar-width: thin;
  }

  .scroll-wrapper::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  .scroll-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .scroll-wrapper::-webkit-scrollbar-thumb {
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
    fill: inherit;
    font-size: var(--timeline-marker-font-size, 0.9rem);
  }
`;
