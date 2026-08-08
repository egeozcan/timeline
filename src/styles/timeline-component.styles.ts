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
    background: var(--timeline-scrollbar-thumb-color, #47476b);
    border-radius: 10px;
  }

  .timeline-container {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 100px;
  }

  /* List view styles */
  .timeline-container.list-view {
    display: flex;
    flex-direction: column;
    gap: var(--timeline-list-gap, 16px);
    padding: var(--timeline-list-padding, 20px);
  }

  .scroll-wrapper.list-mode {
    overflow-y: auto;
    overflow-x: hidden;
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
