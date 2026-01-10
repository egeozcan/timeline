import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js';

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
          'A timeline event card component that displays a single event with an optional image.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const WithImage: Story = {
  name: 'With Image',
  render: () => html`
    <timeline-event
      date="2024-03-15"
      image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      style="position: relative; visibility: visible;"
    >
      <h3>Design Mockups Approved</h3>
      <p>After several iterations, the design team gets final approval on the UI/UX mockups.</p>
    </timeline-event>
  `,
};

export const WithoutImage: Story = {
  name: 'Without Image (Placeholder)',
  render: () => html`
    <timeline-event date="2024-03-15" style="position: relative; visibility: visible;">
      <h3>Project Kick-off</h3>
      <p>The initial planning and brainstorming phase for the new company website begins.</p>
    </timeline-event>
  `,
};

export const LongContent: Story = {
  name: 'Long Content (Truncated)',
  render: () => html`
    <timeline-event
      date="2024-03-15"
      image-src="https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600"
      style="position: relative; visibility: visible;"
    >
      <h3>This is a very long title that should be truncated after two lines of text</h3>
      <p>
        This is a very long description that should be truncated after three lines. It contains a
        lot of text that explains the event in great detail, including all the important information
        that the user might need to know about what happened on this particular date.
      </p>
    </timeline-event>
  `,
};

export const CustomWidth: Story = {
  name: 'Custom Width',
  render: () => html`
    <timeline-event
      date="2024-03-15"
      image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      style="position: relative; visibility: visible; --timeline-event-width: 350px;"
    >
      <h3>Wider Event Card</h3>
      <p>This card uses a custom width of 350px instead of the default 250px.</p>
    </timeline-event>
  `,
};
