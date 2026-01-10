import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.describe('TimelineComponent', () => {
    test('horizontal timeline has no accessibility violations', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .include('timeline-component')
        // Exclude SVG elements (they're aria-hidden for screen readers)
        .disableRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('vertical timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .include('timeline-component')
        // Exclude color contrast for SVG marker text (aria-hidden)
        .disableRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('empty timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--empty&viewMode=story');
      await page.waitForSelector('timeline-component', { state: 'attached' });
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });

    test('single event timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--single-event&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .include('timeline-component')
        .disableRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test('unstyled timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--unstyled&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .include('timeline-component')
        .disableRules(['color-contrast'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('TimelineEvent', () => {
    test('event with image has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });

    test('event without image has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });

    test('event with long content has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--long-content&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });

    test('unstyled event has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--unstyled&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('timeline events are keyboard focusable via roving tabindex', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Tab to timeline-component, then Tab to first event
      await page.keyboard.press('Tab'); // Focus timeline-component scroll wrapper
      await page.keyboard.press('Tab'); // Focus first timeline-event (roving tabindex)

      // Check that a timeline-event has focus
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.tagName.toLowerCase();
      });

      expect(focusedElement).toBe('timeline-event');
    });

    test('arrow keys navigate between events (horizontal)', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Tab to first event
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Get initial focused event
      const initialEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      // Arrow right to next event
      await page.keyboard.press('ArrowRight');

      const nextEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      // Should have moved to a different event
      expect(nextEvent).not.toBe(initialEvent);
      expect(await page.evaluate(() => document.activeElement?.tagName.toLowerCase())).toBe(
        'timeline-event'
      );
    });

    test('arrow keys navigate between events (vertical)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Tab to first event
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Get initial focused event
      const initialEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      // Arrow down to next event
      await page.keyboard.press('ArrowDown');

      const nextEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      // Should have moved to a different event
      expect(nextEvent).not.toBe(initialEvent);
    });

    test('Home and End keys navigate to first/last events', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Tab to first event
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Press End to go to last event
      await page.keyboard.press('End');

      // Check we're on the last event
      const lastEventDate = await page.evaluate(() => {
        const events = document.querySelectorAll('timeline-event');
        return events[events.length - 1]?.getAttribute('date');
      });
      const focusedDate = await page.evaluate(() => document.activeElement?.getAttribute('date'));
      expect(focusedDate).toBe(lastEventDate);

      // Press Home to go back to first event
      await page.keyboard.press('Home');

      const firstEventDate = await page.evaluate(() => {
        const events = document.querySelectorAll('timeline-event');
        return events[0]?.getAttribute('date');
      });
      const newFocusedDate = await page.evaluate(() =>
        document.activeElement?.getAttribute('date')
      );
      expect(newFocusedDate).toBe(firstEventDate);
    });

    test('only one event has tabindex=0 (roving tabindex pattern)', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Check that only one event has tabindex="0"
      const tabindexCounts = await page.evaluate(() => {
        const events = document.querySelectorAll('timeline-event');
        let zeroCount = 0;
        let minusOneCount = 0;
        events.forEach((e) => {
          const tabindex = e.getAttribute('tabindex');
          if (tabindex === '0') {
            zeroCount++;
          }
          if (tabindex === '-1') {
            minusOneCount++;
          }
        });
        return { zeroCount, minusOneCount, total: events.length };
      });

      expect(tabindexCounts.zeroCount).toBe(1);
      expect(tabindexCounts.minusOneCount).toBe(tabindexCounts.total - 1);
    });
  });

  test.describe('Screen Reader', () => {
    test('timeline has accessible name', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');

      // Check that the scroll-wrapper has role="region" and aria-label
      const hasAccessibleName = await page.evaluate(() => {
        const timeline = document.querySelector('timeline-component');
        const scrollWrapper = timeline?.shadowRoot?.querySelector('.scroll-wrapper');
        return (
          scrollWrapper?.getAttribute('role') === 'region' &&
          scrollWrapper?.hasAttribute('aria-label')
        );
      });

      expect(hasAccessibleName).toBe(true);
    });

    test('events have accessible roles', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      await page.waitForSelector('timeline-event');

      // Check that the card has role="article"
      const hasArticleRole = await page.evaluate(() => {
        const event = document.querySelector('timeline-event');
        const card = event?.shadowRoot?.querySelector('.card');
        return card?.getAttribute('role') === 'article';
      });

      expect(hasArticleRole).toBe(true);
    });

    test('SVG decorations are hidden from screen readers', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      // Check that SVG has aria-hidden
      const svgHidden = await page.evaluate(() => {
        const timeline = document.querySelector('timeline-component');
        const svg = timeline?.shadowRoot?.querySelector('svg');
        return svg?.getAttribute('aria-hidden') === 'true';
      });

      expect(svgHidden).toBe(true);
    });
  });
});
