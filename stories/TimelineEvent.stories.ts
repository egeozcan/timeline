import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js';

// Dark theme styles (replicates theme-dark.css for storybook)
const darkThemeStyles = html`
  <style>
    /* Dark Theme via CSS Parts */
    .timeline-dark-theme timeline-event::part(card) {
      background-color: #2c2c54;
      border: 1px solid #47476b;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .timeline-dark-theme timeline-event::part(image),
    .timeline-dark-theme timeline-event::part(image-placeholder) {
      background-color: #3a3a66;
    }
    .timeline-dark-theme timeline-event::part(image-placeholder) {
      color: #b8b8d0;
    }
    .timeline-dark-theme timeline-event h3 {
      color: #ffffff;
    }
    .timeline-dark-theme timeline-event p {
      color: #a4a4c1;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/TimelineEvent',
  tags: ['autodocs'],
  argTypes: {
    date: {
      control: 'text',
      description: 'Event date in YYYY-MM-DD format',
    },
    imageSrc: {
      control: 'text',
      description: 'URL for the event image',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A timeline event card component that displays a single event with an optional image. By default, components have minimal styling - use CSS parts to apply themes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const WithImage: Story = {
  name: 'With Image',
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-event
        date="2024-03-15"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
        style="position: relative; visibility: visible;"
      >
        <h3>Design Mockups Approved</h3>
        <p>After several iterations, the design team gets final approval on the UI/UX mockups.</p>
      </timeline-event>
    </div>
  `,
};

export const WithoutImage: Story = {
  name: 'Without Image (Placeholder)',
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-event date="2024-03-15" style="position: relative; visibility: visible;">
        <h3>Project Kick-off</h3>
        <p>The initial planning and brainstorming phase for the new company website begins.</p>
      </timeline-event>
    </div>
  `,
};

export const LongContent: Story = {
  name: 'Long Content (Truncated)',
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-event
        date="2024-03-15"
        image-src="https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600"
        style="position: relative; visibility: visible;"
      >
        <h3>This is a very long title that should be truncated after two lines of text</h3>
        <p>
          This is a very long description that should be truncated after three lines. It contains a
          lot of text that explains the event in great detail, including all the important
          information that the user might need to know about what happened on this particular date.
        </p>
      </timeline-event>
    </div>
  `,
};

export const CustomWidth: Story = {
  name: 'Custom Width',
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-event
        date="2024-03-15"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
        style="position: relative; visibility: visible; --timeline-event-width: 350px;"
      >
        <h3>Wider Event Card</h3>
        <p>This card uses a custom width of 350px instead of the default 250px.</p>
      </timeline-event>
    </div>
  `,
};

export const Unstyled: Story = {
  name: 'Unstyled (Minimal Defaults)',
  parameters: {
    docs: {
      description: {
        story:
          'Event with no theme applied, showing minimal default styling. A light background is added for visibility since the unstyled components have no colors.',
      },
    },
  },
  render: () => html`
    <style>
      .unstyled-wrapper {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        display: inline-block;
      }
      .unstyled-wrapper timeline-event::part(card) {
        background: #ffffff;
        border: 1px solid #e0e0e0;
      }
    </style>
    <div class="unstyled-wrapper">
      <timeline-event date="2024-03-15" style="position: relative; visibility: visible;">
        <h3>Unstyled Event</h3>
        <p>This event has no theme applied, showing only structural styling.</p>
      </timeline-event>
    </div>
  `,
};
