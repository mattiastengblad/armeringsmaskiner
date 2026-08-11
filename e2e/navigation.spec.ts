import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with hero and featured products', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pär Bergman');
    await expect(page.getByRole('heading', { name: 'Pärs urval' })).toBeVisible();
  });

  test('can navigate from homepage to a category page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Bockmaskiner' }).first().click();
    await expect(page).toHaveURL(/\/produkter\/bockmaskiner$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bockmaskiner');
  });

  test('can navigate from a category page to a product page', async ({ page }) => {
    await page.goto('/produkter/bockmaskiner');
    await page.getByRole('link', { name: /BD 36/ }).first().click();
    await expect(page).toHaveURL(/\/produkter\/bockmaskiner\/bd-36$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('BD 36');
    await expect(page.getByText('Tekniska data')).toBeVisible();
  });

  test('unknown product returns 404', async ({ page }) => {
    const response = await page.goto('/produkter/bockmaskiner/finns-inte');
    expect(response?.status()).toBe(404);
  });

  test('unpublished product is not reachable', async ({ page }) => {
    const response = await page.goto('/produkter/klippmaskiner/h-26');
    expect(response?.status()).toBe(404);
  });

  test('documentation page lists downloadable PDFs', async ({ page }) => {
    await page.goto('/dokumentation');
    const firstDoc = page
      .getByRole('link')
      .filter({ hasText: /manual|certifikat|garanti/i })
      .first();
    await expect(firstDoc).toBeVisible();
  });
});
