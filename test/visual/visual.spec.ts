import { test, expect, type Locator, type Page } from '@playwright/test';

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

test.describe('@visual Visual Regression Tests', () => {
  test.describe('TimelineComponent', () => {
    test('horizontal yearly view', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-horizontal-yearly.png'
      );
    });

    test('horizontal monthly view', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-horizontal-monthly.png'
      );
    });

    test('vertical view', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-vertical.png');
    });

    test('empty timeline', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--empty&viewMode=story');
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-empty.png');
    });

    test('single event', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--single-event&viewMode=story');
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-single-event.png'
      );
    });

    test('list view', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--list-view&viewMode=story&globals=theme:dark'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-list-view.png');
    });
  });

  test.describe('TimelineEvent', () => {
    test('with image', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event).toHaveScreenshot('event-with-image.png');
    });

    test('without image (placeholder)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event).toHaveScreenshot('event-placeholder.png');
    });

    test('long content (truncated)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--long-content&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event).toHaveScreenshot('event-long-content.png');
    });

    test('custom width', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--custom-width&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);

      await expect(event).toHaveScreenshot('event-custom-width.png');
    });

    test('hover state', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);
      await event.hover();

      await expect(event).toHaveScreenshot('event-hover.png');
    });

    test('focus state', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      const event = page.locator('timeline-event');
      await waitForEventReady(event);
      await event.focus();

      await expect(event).toHaveScreenshot('event-focus.png');
    });
  });

  test.describe('Responsive', () => {
    test('mobile viewport - vertical', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-mobile.png');
    });

    test('tablet viewport - horizontal', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-tablet.png');
    });

    test('wide viewport - horizontal yearly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-wide.png');
    });
  });

  test.describe('Theming', () => {
    test('dark theme', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story&globals=theme:dark'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('.timeline-dark-theme')).toHaveScreenshot('theme-dark.png');
    });

    test('light theme', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story&globals=theme:light'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('.timeline-light-theme')).toHaveScreenshot('theme-light.png');
    });

    test('modern theme', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story&globals=theme:modern'
      );
      await waitForTimelineReady(page);

      await expect(page.locator('.timeline-modern-theme')).toHaveScreenshot('theme-modern.png');
    });
  });
});
