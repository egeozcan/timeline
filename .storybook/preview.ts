import type { Preview } from '@storybook/web-components';
import { html } from 'lit';

// Import components for registration
import '../src/index.js';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (story) => html`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      </style>
      ${story()}
    `,
  ],
};

export default preview;
