import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function waitForTimelineReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const timeline = document.querySelector('timeline-component');
    const events = [...document.querySelectorAll('timeline-event')];
    return (
      timeline?.shadowRoot?.querySelector('.timeline-container') &&
      events.every(
        (event) =>
          getComputedStyle(event).visibility === 'visible' &&
          (!event.shadowRoot?.querySelector('img') ||
            event.shadowRoot.querySelector('img')?.complete)
      )
    );
  });
  await page.evaluate(() => document.fonts.ready);

  await page
    .locator('timeline-event')
    .locator('img')
    .evaluateAll((images) => {
      const failedImage = images.find((image) => image.naturalWidth === 0);
      if (failedImage) {
        throw new Error(`Timeline image failed to load: ${failedImage.src}`);
      }
    });
}

async function waitForEventReady(locator: Locator): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.evaluate(async (event) => {
    await customElements.whenDefined('timeline-event');
    const timelineEvent = event as HTMLElement & { updateComplete?: Promise<unknown> };
    await timelineEvent.updateComplete;

    const image = timelineEvent.shadowRoot?.querySelector('img');
    if (image && !image.complete) {
      await new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => reject(new Error(`Image failed: ${image.src}`)), {
          once: true,
        });
      });
    }
    if (image && image.naturalWidth === 0) {
      throw new Error(`Timeline image failed to load: ${image.src}`);
    }
  });
  await locator.page().evaluate(() => document.fonts.ready);
}

test.describe('@accessibility Accessibility Tests', () => {
  test.describe('TimelineComponent', () => {
    test('horizontal timeline has no accessibility violations', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });

    test('vertical timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });

    test('empty timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--empty&viewMode=story');
      await waitForTimelineReady(page);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });

    test('single event timeline has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--single-event&viewMode=story');
      await waitForTimelineReady(page);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });

    test('list view has no accessibility violations', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--list-view&viewMode=story&globals=theme:dark'
      );
      await waitForTimelineReady(page);

      const results = await new AxeBuilder({ page }).include('timeline-component').analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('TimelineEvent', () => {
    test('event with image has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });

    test('event without image has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });

    test('event with long content has no accessibility violations', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--long-content&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      const results = await new AxeBuilder({ page }).include('timeline-event').analyze();

      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('timeline events are keyboard focusable via roving tabindex', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() =>
        document.activeElement?.tagName.toLowerCase()
      );

      expect(focusedElement).toBe('timeline-event');
    });

    test('arrow keys navigate between events (horizontal)', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const initialEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));
      await page.keyboard.press('ArrowRight');
      const nextEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      expect(nextEvent).not.toBe(initialEvent);
      expect(await page.evaluate(() => document.activeElement?.tagName.toLowerCase())).toBe(
        'timeline-event'
      );
    });

    test('arrow keys navigate between events (vertical)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const initialEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));
      await page.keyboard.press('ArrowDown');
      const nextEvent = await page.evaluate(() => document.activeElement?.getAttribute('date'));

      expect(nextEvent).not.toBe(initialEvent);
    });

    test('Home and End keys navigate to first/last events', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('End');

      const lastEventDate = await page.evaluate(() => {
        const events = document.querySelectorAll('timeline-event');
        return events[events.length - 1]?.getAttribute('date');
      });
      const focusedDate = await page.evaluate(() => document.activeElement?.getAttribute('date'));
      expect(focusedDate).toBe(lastEventDate);

      await page.keyboard.press('Home');

      const firstEventDate = await page.evaluate(() =>
        document.querySelector('timeline-event')?.getAttribute('date')
      );
      const newFocusedDate = await page.evaluate(() =>
        document.activeElement?.getAttribute('date')
      );
      expect(newFocusedDate).toBe(firstEventDate);
    });

    test('only one event has tabindex=0 (roving tabindex pattern)', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      const tabindexCounts = await page.evaluate(() => {
        const events = document.querySelectorAll('timeline-event');
        let zeroCount = 0;
        let minusOneCount = 0;
        events.forEach((event) => {
          const tabindex = event.getAttribute('tabindex');
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
    const labelledTimelineStories = [
      'horizontal-yearly',
      'horizontal-monthly',
      'vertical',
      'list-view',
      'empty',
      'single-event',
    ];

    for (const story of labelledTimelineStories) {
      test(`${story} timeline has a non-empty accessible name`, async ({ page }) => {
        await page.goto(`/iframe.html?id=components-timelinecomponent--${story}&viewMode=story`);
        await waitForTimelineReady(page);

        const region = page.locator('timeline-component').locator('.scroll-wrapper');
        await expect(region).toHaveRole('region');
        await expect(region).toHaveAccessibleName(/\S+/);
      });
    }

    test('events have accessible roles', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event.locator('.card')).toHaveRole('article');
    });

    test('SVG decorations are hidden from screen readers', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      const svgHidden = await page.evaluate(() => {
        const timeline = document.querySelector('timeline-component');
        const svg = timeline?.shadowRoot?.querySelector('svg');
        return svg?.getAttribute('aria-hidden') === 'true';
      });

      expect(svgHidden).toBe(true);
    });
  });
});
