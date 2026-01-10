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

// Modern theme styles (replicates theme-modern.css for storybook)
const modernThemeStyles = html`
  <style>
    /* Modern Theme via CSS Parts - Light Glass-morphism */
    .timeline-modern-theme {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
      padding: 40px 20px;
      border-radius: 16px;
      min-height: 400px;
    }
    .timeline-modern-theme timeline-component::part(axis-line) {
      stroke: #14b8a6;
      stroke-width: 3;
    }
    .timeline-modern-theme timeline-component::part(connector-line) {
      stroke: #99f6e4;
      stroke-width: 2;
      stroke-dasharray: 4 4;
    }
    .timeline-modern-theme timeline-component::part(dot) {
      fill: #14b8a6;
      filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.4));
    }
    .timeline-modern-theme timeline-component::part(marker-tick) {
      stroke: #94a3b8;
      stroke-width: 2;
    }
    .timeline-modern-theme timeline-component::part(marker-text) {
      fill: #64748b;
      font-weight: 500;
    }
    .timeline-modern-theme timeline-event::part(card) {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 20px;
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(255, 255, 255, 0.8) inset;
    }
    .timeline-modern-theme timeline-event:hover::part(card),
    .timeline-modern-theme timeline-event:focus-within::part(card) {
      border-color: rgba(20, 184, 166, 0.4);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.9) inset;
    }
    .timeline-modern-theme timeline-event::part(image),
    .timeline-modern-theme timeline-event::part(image-placeholder) {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }
    .timeline-modern-theme timeline-event::part(image-placeholder) {
      color: #64748b;
    }
    .timeline-modern-theme timeline-event::part(date) {
      color: #14b8a6;
    }
    .timeline-modern-theme timeline-event h3 {
      color: #0f172a;
    }
    .timeline-modern-theme timeline-event p {
      color: #475569;
    }
    .timeline-modern-theme timeline-event:focus {
      outline: 2px solid #14b8a6;
      outline-offset: 4px;
      border-radius: 20px;
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
    list: {
      control: 'boolean',
      description: 'Display events in a simple list format without timeline axis',
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
    vertical: false,
    list: false,
    label: 'Timeline',
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
  args: {
    vertical: false,
    startYear: 1970,
    endYear: 2010,
    label: "A timeline of a teacher's career journey from 1970 to 2010.",
  },
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal timeline spanning multiple years with dark theme applied. Shows 5-year markers and is ideal for long-term timelines like career histories.',
      },
    },
  },
  render: (args) => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component
        ?vertical=${args.vertical}
        ?list=${args.list}
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
    </div>
  `,
};

export const HorizontalMonthly: Story = {
  name: 'Horizontal Monthly View (Auto-Detected)',
  args: {
    vertical: false,
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
  render: (args) => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
  args: {
    vertical: true,
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
  render: (args) => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
  args: {
    vertical: true,
    list: false,
    label: 'A custom-styled vertical timeline.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A vertical timeline with custom styling using CSS parts. Demonstrates how theming is done purely through ::part() selectors.',
      },
    },
  },
  render: (args) => html`
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
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
  args: {
    vertical: false,
    list: false,
    label: 'A light-themed timeline.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A timeline with the light theme applied via CSS parts. Ideal for light-background applications.',
      },
    },
  },
  render: (args) => html`
    ${lightThemeStyles}
    <div class="timeline-light-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
  args: {
    vertical: false,
    list: false,
    label: 'An unstyled timeline showing minimal defaults.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Timeline with no theme applied, showing minimal default styling. This demonstrates the base appearance that consumers can style via CSS parts. Note: A light background is added here for visibility since the default unstyled components have no colors.',
      },
    },
  },
  render: (args) => html`
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
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
  args: {
    vertical: false,
    list: false,
    label: 'An empty timeline.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A timeline with no events. Shows the component gracefully handles empty state.',
      },
    },
  },
  render: (args) => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
      </timeline-component>
    </div>
  `,
};

export const SingleEvent: Story = {
  name: 'Single Event',
  args: {
    vertical: false,
    list: false,
    label: 'A timeline with a single event.',
  },
  parameters: {
    docs: {
      description: {
        story: 'A timeline with only one event.',
      },
    },
  },
  render: (args) => html`
    ${darkThemeStyles}
    <div class="timeline-dark-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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

export const ModernTheme: Story = {
  name: 'Modern Theme',
  args: {
    vertical: false,
    list: false,
    label: 'A modern-themed timeline.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A timeline with the modern glass-morphism theme featuring a light background, blur effects, and teal accents.',
      },
    },
  },
  render: (args) => html`
    ${modernThemeStyles}
    <div class="timeline-modern-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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

export const ModernThemeVertical: Story = {
  name: 'Modern Theme (Vertical)',
  args: {
    vertical: true,
    list: false,
    label: 'A modern-themed vertical timeline.',
  },
  parameters: {
    docs: {
      description: {
        story: 'The modern glass-morphism theme applied to a vertical timeline layout.',
      },
    },
  },
  render: (args) => html`
    ${modernThemeStyles}
    <div class="timeline-modern-theme">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
      </timeline-component>
    </div>
  `,
};

export const ListView: Story = {
  name: 'List View',
  args: {
    vertical: false,
    list: true,
    label: 'A list view of project milestones.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A simple list layout that displays events chronologically without the timeline axis. Ideal for simpler presentations or responsive designs.',
      },
    },
  },
  render: (args) => html`
    ${darkThemeStyles}
    <style>
      /* List view specific overrides */
      .timeline-dark-theme timeline-event::part(date) {
        color: #ff6b6b;
        font-weight: 600;
      }
    </style>
    <div class="timeline-dark-theme" style="max-width: 700px;">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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

export const ListViewModern: Story = {
  name: 'List View (Modern Theme)',
  args: {
    vertical: false,
    list: true,
    label: 'A modern-themed list view.',
  },
  parameters: {
    docs: {
      description: {
        story: 'The list view layout with the modern glass-morphism theme applied.',
      },
    },
  },
  render: (args) => html`
    ${modernThemeStyles}
    <div class="timeline-modern-theme" style="max-width: 700px;">
      <timeline-component ?vertical=${args.vertical} ?list=${args.list} label="${args.label}">
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
      </timeline-component>
    </div>
  `,
};
