import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('TimelineComponent', () => {
    test('horizontal yearly view', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');

      // Wait for layout calculation and images to load
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-horizontal-yearly.png'
      );
    });

    test('horizontal monthly view', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-horizontal-monthly.png'
      );
    });

    test('vertical view', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-vertical.png');
    });

    test('custom styled view', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--custom-styled&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-custom-styled.png'
      );
    });

    test('empty timeline', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--empty&viewMode=story');
      await page.waitForSelector('timeline-component', { state: 'attached' });
      await page.waitForTimeout(500);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-empty.png');
    });

    test('single event', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--single-event&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-single-event.png'
      );
    });

    test('unstyled view', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelinecomponent--unstyled&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('.unstyled-wrapper')).toHaveScreenshot('timeline-unstyled.png');
    });
  });

  test.describe('TimelineEvent', () => {
    test('with image', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      await page.waitForSelector('timeline-event');

      // Wait for image to load
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-with-image.png');
    });

    test('without image (placeholder)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--without-image&viewMode=story');
      await page.waitForSelector('timeline-event');

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-placeholder.png');
    });

    test('long content (truncated)', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--long-content&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-long-content.png');
    });

    test('custom width', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--custom-width&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-custom-width.png');
    });

    test('hover state', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      await page.locator('timeline-event').hover();
      await page.waitForTimeout(300); // Wait for hover transition

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-hover.png');
    });

    test('focus state', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--with-image&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      await page.locator('timeline-event').focus();
      await page.waitForTimeout(300); // Wait for focus transition

      await expect(page.locator('timeline-event')).toHaveScreenshot('event-focus.png');
    });

    test('unstyled event', async ({ page }) => {
      await page.goto('/iframe.html?id=components-timelineevent--unstyled&viewMode=story');
      await page.waitForSelector('timeline-event');
      await page.waitForTimeout(500);

      await expect(page.locator('.unstyled-wrapper')).toHaveScreenshot('event-unstyled.png');
    });
  });

  test.describe('Responsive', () => {
    test('mobile viewport - vertical', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/iframe.html?id=components-timelinecomponent--vertical&viewMode=story');
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-mobile.png');
    });

    test('tablet viewport - horizontal', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-tablet.png');
    });

    test('wide viewport - horizontal yearly', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-yearly&viewMode=story'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot('timeline-wide.png');
    });
  });

  test.describe('Theming', () => {
    test('light background', async ({ page }) => {
      await page.goto(
        '/iframe.html?id=components-timelinecomponent--horizontal-monthly&viewMode=story&globals=backgrounds.value:!hex(ffffff)'
      );
      await page.waitForSelector('timeline-component');
      await page.waitForTimeout(1000);

      await expect(page.locator('timeline-component')).toHaveScreenshot(
        'timeline-light-background.png'
      );
    });
  });
});
