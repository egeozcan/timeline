import type { Preview } from '@storybook/web-components';
import { html } from 'lit';

// Import components for registration
import '../src/index.js';

// Import all theme CSS files - scoped to their wrapper classes
import '../src/styles/theme-dark.css';
import '../src/styles/theme-light.css';
import '../src/styles/theme-modern.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Theme for timeline components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: ['dark', 'light', 'modern', 'none'],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      expanded: true,
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Themes handle their own backgrounds
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme || 'dark';
      const themeClass = theme === 'none' ? 'timeline-unstyled' : `timeline-${theme}-theme`;

      return html`
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Minimal styling for unstyled theme visibility */
          .timeline-unstyled {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
          }
          .timeline-unstyled timeline-event::part(card) {
            background: #ffffff;
            border: 1px solid #e0e0e0;
          }
          .timeline-unstyled timeline-component::part(axis-line),
          .timeline-unstyled timeline-component::part(connector-line) {
            stroke: #999;
          }
          .timeline-unstyled timeline-component::part(dot) {
            fill: #666;
          }
          .timeline-unstyled timeline-component::part(marker-tick) {
            stroke: #999;
          }
          .timeline-unstyled timeline-component::part(marker-text) {
            fill: #666;
          }
        </style>
        <div class="${themeClass}">${story()}</div>
      `;
    },
  ],
};

export default preview;
