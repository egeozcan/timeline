import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../src/index.js';

// Dark theme styles (replicates theme-dark.css for storybook)
const darkThemeStyles = html`
  <style>
    /* Dark Theme via CSS Parts */
    .timeline-dark-theme timeline-component::part(axis-line) {
      stroke: #47476b;
      stroke-width: 2;
    }
    .timeline-dark-theme timeline-component::part(connector-line) {
      stroke: #47476b;
      stroke-width: 2;
    }
    .timeline-dark-theme timeline-component::part(dot) {
      fill: #ff6b6b;
    }
    .timeline-dark-theme timeline-component::part(marker-tick) {
      stroke: #a4a4c1;
      stroke-width: 2;
    }
    .timeline-dark-theme timeline-component::part(marker-text) {
      fill: #a4a4c1;
    }
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

// Light theme styles (replicates theme-light.css for storybook)
const lightThemeStyles = html`
  <style>
    /* Light Theme via CSS Parts */
    .timeline-light-theme {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
    }
    .timeline-light-theme timeline-component::part(axis-line) {
      stroke: #94a3b8;
      stroke-width: 2;
    }
    .timeline-light-theme timeline-component::part(connector-line) {
      stroke: #94a3b8;
      stroke-width: 2;
    }
    .timeline-light-theme timeline-component::part(dot) {
      fill: #3b82f6;
    }
    .timeline-light-theme timeline-component::part(marker-tick) {
      stroke: #64748b;
      stroke-width: 2;
    }
    .timeline-light-theme timeline-component::part(marker-text) {
      fill: #64748b;
    }
    .timeline-light-theme timeline-event::part(card) {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    }
    .timeline-light-theme timeline-event::part(image),
    .timeline-light-theme timeline-event::part(image-placeholder) {
      background-color: #f1f5f9;
    }
    .timeline-light-theme timeline-event::part(image-placeholder) {
      color: #64748b;
    }
    .timeline-light-theme timeline-event h3 {
      color: #1e293b;
    }
    .timeline-light-theme timeline-event p {
      color: #475569;
    }
  </style>
`;

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
          'A timeline container component that positions events chronologically on a horizontal or vertical axis. By default, components have minimal styling - use CSS parts to apply themes.',
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
          'A horizontal timeline spanning multiple years with dark theme applied. Shows 5-year markers and is ideal for long-term timelines like career histories.',
      },
    },
  },
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
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
    </div>
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
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
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
    </div>
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
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
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
    </div>
  `,
};

export const CustomStyled: Story = {
  name: 'Custom Styled (Orange Theme)',
  parameters: {
    docs: {
      description: {
        story:
          'A vertical timeline with custom styling using CSS parts. Demonstrates how theming is done purely through ::part() selectors.',
      },
    },
  },
  render: () => html`
    <style>
      /* Custom orange theme via CSS Parts */
      .custom-styled-timeline timeline-component::part(axis-line) {
        stroke: #4a5568;
        stroke-width: 2;
      }
      .custom-styled-timeline timeline-component::part(connector-line) {
        stroke: #4a5568;
        stroke-width: 2;
      }
      .custom-styled-timeline timeline-component::part(dot) {
        fill: #f6ad55;
      }
      .custom-styled-timeline timeline-component::part(marker-tick) {
        stroke: #a0aec0;
        stroke-width: 2;
      }
      .custom-styled-timeline timeline-component::part(marker-text) {
        fill: #a0aec0;
      }
      .custom-styled-timeline timeline-event::part(card) {
        background-color: #2d3748;
        border: 1px solid #4a5568;
        border-radius: 28px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.4),
          0 2px 4px -1px rgba(0, 0, 0, 0.2);
      }
      .custom-styled-timeline timeline-event::part(image),
      .custom-styled-timeline timeline-event::part(image-placeholder) {
        background-color: #3a4a5a;
      }
      .custom-styled-timeline timeline-event::part(image) {
        filter: grayscale(90%);
        transition: filter 0.3s ease;
      }
      .custom-styled-timeline timeline-event:hover::part(image) {
        filter: grayscale(0%);
      }
      .custom-styled-timeline timeline-event h3 {
        color: #f7fafc;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .custom-styled-timeline timeline-event p {
        color: #e2e8f0;
      }
    </style>
    <div class="custom-styled-timeline">
      <timeline-component vertical label="A custom-styled vertical timeline.">
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
    </div>
  `,
};

export const LightTheme: Story = {
  name: 'Light Theme',
  parameters: {
    docs: {
      description: {
        story:
          'A timeline with the light theme applied via CSS parts. Ideal for light-background applications.',
      },
    },
  },
  render: () => html`
    ${lightThemeStyles}
    <div class="timeline-light-theme">
      <timeline-component label="A light-themed timeline.">
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
    </div>
  `,
};

export const Unstyled: Story = {
  name: 'Unstyled (Minimal Defaults)',
  parameters: {
    docs: {
      description: {
        story:
          'Timeline with no theme applied, showing minimal default styling. This demonstrates the base appearance that consumers can style via CSS parts. Note: A light background is added here for visibility since the default unstyled components have no colors.',
      },
    },
  },
  render: () => html`
    <style>
      /* Light background wrapper for unstyled visibility */
      .unstyled-wrapper {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
      }
      .unstyled-wrapper timeline-event::part(card) {
        background: #ffffff;
        border: 1px solid #e0e0e0;
      }
      .unstyled-wrapper timeline-component::part(axis-line),
      .unstyled-wrapper timeline-component::part(connector-line) {
        stroke: #999;
      }
      .unstyled-wrapper timeline-component::part(dot) {
        fill: #666;
      }
      .unstyled-wrapper timeline-component::part(marker-tick) {
        stroke: #999;
      }
      .unstyled-wrapper timeline-component::part(marker-text) {
        fill: #666;
      }
    </style>
    <div class="unstyled-wrapper">
      <timeline-component label="An unstyled timeline showing minimal defaults.">
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
    </div>
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
  render: () => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component label="An empty timeline."> </timeline-component>
    </div>
  `,
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
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component label="A timeline with a single event.">
        <timeline-event
          date="2024-06-15"
          image-src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600"
        >
          <h3>The Big Launch</h3>
          <p>Our product finally launches to the public after months of development.</p>
        </timeline-event>
      </timeline-component>
    </div>
  `,
};
