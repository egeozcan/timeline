import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js';

const meta: Meta = {
  title: 'Components/TimelineComponent',
  tags: ['autodocs'],
  argTypes: {
    vertical: {
      control: 'boolean',
      description: 'Display timeline vertically',
    },
    startYear: {
      control: 'number',
      description: 'Override start year for timeline range',
    },
    endYear: {
      control: 'number',
      description: 'Override end year for timeline range',
    },
    label: {
      control: 'text',
      description: 'Accessible label for the timeline',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A timeline container component that positions events chronologically on a horizontal or vertical axis.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const HorizontalYearly: Story = {
  name: 'Horizontal Yearly View',
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal timeline spanning multiple years. Shows 5-year markers and is ideal for long-term timelines like career histories.',
      },
    },
  },
  render: () => html`
    <timeline-component
      start-year="1970"
      end-year="2010"
      label="A timeline of a teacher's career journey from 1970 to 2010."
    >
      <timeline-event
        date="1972-08-13"
        image-src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Parkside Elementary School</h3>
        <p>I began my teaching career here in a 3rd grade classroom and never left!</p>
      </timeline-event>
      <timeline-event
        date="1978-03-10"
        image-src="https://images.pexels.com/photos/7148596/pexels-photo-7148596.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>My Co-Teacher, Jenny</h3>
        <p>
          Me and Jenny, who helped me stay sane through all the years of standardized testing...
        </p>
      </timeline-event>
      <timeline-event
        date="1991-10-15"
        image-src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Science Fair</h3>
        <p>Some students presenting their project for our annual classroom science fair.</p>
      </timeline-event>
      <timeline-event
        date="2001-04-21"
        image-src="https://images.pexels.com/photos/8617966/pexels-photo-8617966.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Poetry Unit</h3>
        <p>Teaching my favorite unit where students were challenged to write poems...</p>
      </timeline-event>
    </timeline-component>
  `,
};

export const HorizontalMonthly: Story = {
  name: 'Horizontal Monthly View (Auto-Detected)',
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal timeline with auto-detected date range. Shows monthly markers and is ideal for project timelines spanning months.',
      },
    },
  },
  render: () => html`
    <timeline-component label="A timeline of project milestones over a few months.">
      <timeline-event date="2024-03-15">
        <h3>Project Kick-off</h3>
        <p>The initial planning and brainstorming phase for the new company website begins.</p>
      </timeline-event>
      <timeline-event
        date="2024-05-22"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Design Mockups Approved</h3>
        <p>After several iterations, the design team gets final approval on the UI/UX mockups.</p>
      </timeline-event>
      <timeline-event date="2024-05-28">
        <h3>Development Sprint 1</h3>
        <p>First development sprint starts, focusing on the core architecture and homepage.</p>
      </timeline-event>
      <timeline-event
        date="2024-07-01"
        image-src="https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Alpha Version Deployed</h3>
        <p>An internal alpha version is deployed for testing and feedback from the team.</p>
      </timeline-event>
      <timeline-event date="2024-09-10">
        <h3>User Acceptance Testing</h3>
        <p>The project is handed over to the client for final user acceptance testing (UAT).</p>
      </timeline-event>
    </timeline-component>
  `,
};

export const Vertical: Story = {
  name: 'Vertical View',
  parameters: {
    docs: {
      description: {
        story:
          'A vertical timeline with events alternating left and right. Ideal for displaying events in a more compact, scrollable format.',
      },
    },
  },
  render: () => html`
    <timeline-component vertical label="A vertical timeline of project milestones.">
      <timeline-event date="2024-03-15">
        <h3>Project Kick-off</h3>
        <p>The initial planning and brainstorming phase for the new company website begins.</p>
      </timeline-event>
      <timeline-event
        date="2024-05-22"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Design Mockups Approved</h3>
        <p>After several iterations, the design team gets final approval on the UI/UX mockups.</p>
      </timeline-event>
      <timeline-event date="2024-05-28">
        <h3>Development Sprint 1</h3>
        <p>First development sprint starts, focusing on the core architecture and homepage.</p>
      </timeline-event>
      <timeline-event
        date="2024-07-01"
        image-src="https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Alpha Version Deployed</h3>
        <p>An internal alpha version is deployed for testing and feedback from the team.</p>
      </timeline-event>
      <timeline-event date="2024-09-10">
        <h3>User Acceptance Testing</h3>
        <p>The project is handed over to the client for final user acceptance testing (UAT).</p>
      </timeline-event>
    </timeline-component>
  `,
};

export const CustomStyled: Story = {
  name: 'Custom Styled Vertical View',
  parameters: {
    docs: {
      description: {
        story:
          'A vertical timeline with custom styling using CSS custom properties. Demonstrates theming capabilities.',
      },
    },
  },
  render: () => html`
    <style>
      .custom-styled-timeline {
        --timeline-axis-color: #4a5568;
        --timeline-connector-color: #4a5568;
        --timeline-dot-color: #f6ad55;
        --timeline-marker-color: #a0aec0;
        --timeline-marker-text-color: #a0aec0;

        --timeline-event-bg-color: #2d3748;
        --timeline-event-border-color: #4a5568;
        --timeline-event-heading-color: #f7fafc;
        --timeline-event-text-color: #e2e8f0;
      }
      .custom-styled-timeline timeline-event::part(card) {
        border-radius: 28px;
        border-width: 11px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.4),
          0 2px 4px -1px rgba(0, 0, 0, 0.2);
      }
      .custom-styled-timeline timeline-event::part(image) {
        filter: grayscale(90%);
        transition: filter 0.3s ease;
      }
      .custom-styled-timeline timeline-event:hover::part(image) {
        filter: grayscale(0%);
      }
      .custom-styled-timeline timeline-event h3 {
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    </style>
    <timeline-component
      vertical
      class="custom-styled-timeline"
      label="A custom-styled vertical timeline."
    >
      <timeline-event date="2024-03-15">
        <h3>Project Kick-off</h3>
        <p>The initial planning and brainstorming phase for the new company website begins.</p>
      </timeline-event>
      <timeline-event
        date="2024-05-22"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>Design Mockups Approved</h3>
        <p>After several iterations, the design team gets final approval on the UI/UX mockups.</p>
      </timeline-event>
      <timeline-event date="2024-05-28">
        <h3>Development Sprint 1</h3>
        <p>First development sprint starts, focusing on the core architecture and homepage.</p>
      </timeline-event>
    </timeline-component>
  `,
};

export const Empty: Story = {
  name: 'Empty Timeline',
  parameters: {
    docs: {
      description: {
        story: 'A timeline with no events. Shows the component gracefully handles empty state.',
      },
    },
  },
  render: () => html` <timeline-component label="An empty timeline."> </timeline-component> `,
};

export const SingleEvent: Story = {
  name: 'Single Event',
  parameters: {
    docs: {
      description: {
        story: 'A timeline with only one event.',
      },
    },
  },
  render: () => html`
    <timeline-component label="A timeline with a single event.">
      <timeline-event
        date="2024-06-15"
        image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
      >
        <h3>The Big Launch</h3>
        <p>Our product finally launches to the public after months of development.</p>
      </timeline-event>
    </timeline-component>
  `,
};
