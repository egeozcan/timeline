import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js';

type DisplayMode = 'horizontal' | 'vertical' | 'list';

const meta: Meta = {
  title: 'Components/TimelineComponent',
  tags: ['autodocs'],
  argTypes: {
    display: {
      control: 'select',
      options: ['horizontal', 'vertical', 'list'],
      description: 'Layout mode for the timeline',
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
  args: {
    display: 'horizontal' as DisplayMode,
    label: 'Timeline',
  },
  parameters: {
    docs: {
      description: {
        component:
          'A timeline container component that positions events chronologically. Use the theme selector in the toolbar to switch between themes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<{
  display: DisplayMode;
  startYear?: number;
  endYear?: number;
  label: string;
}>;

// Helper to convert display mode to component props
const getDisplayProps = (display: DisplayMode) => ({
  vertical: display === 'vertical',
  list: display === 'list',
});

export const HorizontalYearly: Story = {
  name: 'Horizontal Yearly View',
  args: {
    display: 'horizontal',
    startYear: 1970,
    endYear: 2010,
    label: "A timeline of a teacher's career journey from 1970 to 2010.",
  },
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal timeline spanning multiple years. Shows 5-year markers and is ideal for long-term timelines like career histories.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <timeline-component
        ?vertical=${vertical}
        ?list=${list}
        start-year="${args.startYear}"
        end-year="${args.endYear}"
        label="${args.label}"
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
    `;
  },
};

export const HorizontalMonthly: Story = {
  name: 'Horizontal Monthly View (Auto-Detected)',
  args: {
    display: 'horizontal',
    label: 'A timeline of project milestones over a few months.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal timeline with auto-detected date range. Shows monthly markers and is ideal for project timelines spanning months.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <timeline-component ?vertical=${vertical} ?list=${list} label="${args.label}">
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
    `;
  },
};

export const Vertical: Story = {
  name: 'Vertical View',
  args: {
    display: 'vertical',
    label: 'A vertical timeline of project milestones.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A vertical timeline with events alternating left and right. Ideal for displaying events in a more compact, scrollable format.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <timeline-component ?vertical=${vertical} ?list=${list} label="${args.label}">
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
    `;
  },
};

export const ListView: Story = {
  name: 'List View',
  args: {
    display: 'list',
    label: 'A list view of project milestones.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A simple list layout that displays events chronologically without the timeline axis. Shows the event date on each card. Ideal for simpler presentations or responsive designs.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <div style="max-width: 700px;">
        <timeline-component ?vertical=${vertical} ?list=${list} label="${args.label}">
          <timeline-event date="2024-03-15">
            <h3>Project Kick-off</h3>
            <p>The initial planning and brainstorming phase for the new company website begins.</p>
          </timeline-event>
          <timeline-event
            date="2024-05-22"
            image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
          >
            <h3>Design Mockups Approved</h3>
            <p>
              After several iterations, the design team gets final approval on the UI/UX mockups.
            </p>
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
      </div>
    `;
  },
};

export const Empty: Story = {
  name: 'Empty Timeline',
  args: {
    display: 'horizontal',
    label: 'An empty timeline.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A timeline with no events. Shows the component gracefully handles empty state.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <timeline-component ?vertical=${vertical} ?list=${list} label="${args.label}">
      </timeline-component>
    `;
  },
};

export const SingleEvent: Story = {
  name: 'Single Event',
  args: {
    display: 'horizontal',
    label: 'A timeline with a single event.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A timeline with only one event.',
      },
    },
  },
  render: (args) => {
    const { vertical, list } = getDisplayProps(args.display);
    return html`
      <timeline-component ?vertical=${vertical} ?list=${list} label="${args.label}">
        <timeline-event
          date="2024-06-15"
          image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
        >
          <h3>The Big Launch</h3>
          <p>Our product finally launches to the public after months of development.</p>
        </timeline-event>
      </timeline-component>
    `;
  },
};
