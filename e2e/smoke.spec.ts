import { test, expect } from '@playwright/test';

test('app renders home + settings tab', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('home-screen')).toBeVisible();

  await page.getByTestId('tab-settings').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
});
