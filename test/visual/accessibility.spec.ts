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

  test.describe('Integrated behavior', () => {
    test('375px vertical timeline is one-sided without horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);

      const geometry = await page.locator('timeline-component').evaluate((timeline) => {
        const wrapper = timeline.shadowRoot!.querySelector<HTMLElement>('.scroll-wrapper')!;
        const axisPath = timeline
          .shadowRoot!.querySelector('[part="axis-line"]')!
          .getAttribute('d')!;
        const axisX = Number(/^M ([\d.]+),/.exec(axisPath)?.[1]);
        const eventGeometry = Array.from(timeline.querySelectorAll('timeline-event')).map(
          (event) => {
            const cardRect = event
              .shadowRoot!.querySelector<HTMLElement>('.card')!
              .getBoundingClientRect();
            return {
              cardLeft: cardRect.left,
              cardRight: cardRect.right,
              layoutLeft: Number.parseFloat((event as HTMLElement).style.left),
            };
          }
        );
        return {
          axisX,
          eventGeometry,
          wrapperClientWidth: wrapper.clientWidth,
          wrapperScrollWidth: wrapper.scrollWidth,
          documentClientWidth: document.documentElement.clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.eventGeometry.length).toBeGreaterThan(1);
      for (const event of geometry.eventGeometry) {
        expect(event.layoutLeft).toBeGreaterThanOrEqual(geometry.axisX + 30);
        expect(event.cardLeft).toBeGreaterThanOrEqual(0);
        expect(event.cardRight).toBeLessThanOrEqual(375);
      }
      expect(geometry.wrapperScrollWidth).toBeLessThanOrEqual(geometry.wrapperClientWidth);
      expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth);
    });

    test('600px vertical timeline retains events on both sides', async ({ page }) => {
      await page.setViewportSize({ width: 700, height: 800 });
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);
      const timeline = page.locator('timeline-component');
      await timeline.evaluate((element) => {
        (element as HTMLElement).style.width = '600px';
      });
      await page.waitForFunction(() => {
        const element = document.querySelector('timeline-component');
        const axis = element?.shadowRoot?.querySelector('[part="axis-line"]')?.getAttribute('d');
        const axisX = Number(/^M ([\d.]+),/.exec(axis ?? '')?.[1]);
        return element?.style.width === '600px' && axisX > 300;
      });

      const sides = await timeline.evaluate((element) => {
        const axisPath = element
          .shadowRoot!.querySelector('[part="axis-line"]')!
          .getAttribute('d')!;
        const axisX = Number(/^M ([\d.]+),/.exec(axisPath)?.[1]);
        return {
          axisX,
          events: Array.from(element.querySelectorAll<HTMLElement>('timeline-event')).map(
            (event) => ({ left: Number.parseFloat(event.style.left), width: event.offsetWidth })
          ),
        };
      });

      expect(sides.events.some((event) => event.left + event.width < sides.axisX)).toBe(true);
      expect(sides.events.some((event) => event.left > sides.axisX)).toBe(true);
    });

    test('standalone event is visible and focusable without positioning workarounds', async ({
      page,
    }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event).toBeVisible();
      await expect(event).toHaveCSS('position', 'relative');
      await expect(event).toHaveAttribute('tabindex', '0');
      await event.focus();
      await expect(event).toBeFocused();
      await expect(event).not.toHaveAttribute('style', /position|visibility/);
    });

    test('list exposes one date per event with list and listitem semantics', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--list-view&viewMode=story&globals=theme:dark'
      );
      await waitForTimelineReady(page);

      const timeline = page.locator('timeline-component');
      const list = timeline.locator('.scroll-wrapper');
      await expect(list).toHaveRole('list');
      await expect(list).toHaveAccessibleName('A list view of project milestones.');

      const events = timeline.locator('timeline-event');
      await expect(events).toHaveCount(5);
      for (const event of await events.all()) {
        await expect(event).toHaveRole('listitem');
      }

      const firstDate = events.first().locator('time');
      await expect(firstDate).toHaveCount(1);
      await expect(firstDate).toBeVisible();
      await expect(firstDate).toHaveText('March 15, 2024');
      const accessibilityTree = await list.ariaSnapshot();
      expect(accessibilityTree.match(/March 15, 2024/g)).toHaveLength(1);
    });

    test('decorative placeholder is hidden and supplied image alt is exposed', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      const placeholderEvent = page.locator('timeline-event');
      await waitForEventReady(placeholderEvent);
      await expect(placeholderEvent.locator('.image-placeholder')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
      expect(await placeholderEvent.ariaSnapshot()).not.toContain('Timeline event for 2024-03-15');

      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const imageEvent = page.locator('timeline-event');
      await waitForEventReady(imageEvent);
      await expect(imageEvent.locator('img')).toHaveAccessibleName('Approved design mockups');
      expect(await imageEvent.ariaSnapshot()).toContain('Approved design mockups');
    });

    test('omitted timeline label falls back to Timeline', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--empty&viewMode=story');
      await waitForTimelineReady(page);
      const timeline = page.locator('timeline-component');
      await timeline.evaluate(async (element) => {
        element.removeAttribute('label');
        await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
      });

      const wrapper = timeline.locator('.scroll-wrapper');
      await expect(wrapper).toHaveRole('region');
      await expect(wrapper).toHaveAccessibleName('Timeline');
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

        const wrapper = page.locator('timeline-component').locator('.scroll-wrapper');
        await expect(wrapper).toHaveRole(story === 'list-view' ? 'list' : 'region');
        await expect(wrapper).toHaveAccessibleName(/\S+/);
      });
    }

    test('events have accessible roles', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      // The article role lives on the host via ElementInternals, so the element that receives
      // focus is the one carrying the semantics. The inner card must not duplicate the role.
      await expect(event.locator('.card')).not.toHaveAttribute('role');
      await event.focus();
      await expect(event).toBeFocused();
    });

    test('the focused event is the node exposing article semantics', async ({
      page,
      browserName,
    }) => {
      // ElementInternals roles are invisible to Playwright's own ARIA engine, so this reads the
      // browser's real accessibility tree. CDP is Chromium-only.
      test.skip(browserName !== 'chromium', 'requires the Chrome DevTools Protocol');

      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      const client = await page.context().newCDPSession(page);
      const { nodes } = (await client.send('Accessibility.getFullAXTree')) as unknown as {
        nodes: {
          role?: { value?: string };
          name?: { value?: string };
          properties?: { name: string; value?: { value?: unknown } }[];
        }[];
      };
      const focusable = nodes
        .filter((node) => node.role?.value !== 'RootWebArea')
        .find((node) =>
          node.properties?.some(
            (property) => property.name === 'focusable' && property.value?.value === true
          )
        );

      expect(focusable?.role?.value).toBe('article');
      expect(focusable?.name?.value).toBe('Design Mockups Approved');
      // The role must appear exactly once — not on both the host and the inner card.
      expect(nodes.filter((node) => node.role?.value === 'article')).toHaveLength(1);
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
