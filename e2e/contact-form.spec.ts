import { expect, test } from '@playwright/test';

test.describe('Contact form', () => {
  test('shows validation errors for empty submit', async ({ page }) => {
    await page.goto('/kontakt');
    await page.getByRole('button', { name: 'Skicka' }).click();
    await expect(page.getByText('Ange ditt namn.')).toBeVisible();
    await expect(page.getByText('Ange en giltig e-postadress.')).toBeVisible();
    await expect(page.getByText('Skriv ett meddelande.')).toBeVisible();
  });

  test('submits successfully with valid data', async ({ page }) => {
    await page.goto('/kontakt');
    await page.getByLabel('Namn', { exact: true }).fill('Test Testsson');
    await page.getByLabel('E-post', { exact: true }).fill('test@example.com');
    await page
      .getByLabel('Meddelande', { exact: true })
      .fill('Jag är intresserad av en bockmaskin.');
    await page.getByRole('button', { name: 'Skicka' }).click();
    await expect(page.getByText('Tack! Vi har tagit emot ditt meddelande')).toBeVisible();
  });
});
