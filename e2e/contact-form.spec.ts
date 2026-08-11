import { expect, test } from '@playwright/test';
import postgres from 'postgres';

const TEST_EMAIL = 'e2e-test@example.com';

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
    await page.getByLabel('E-post', { exact: true }).fill(TEST_EMAIL);
    await page
      .getByLabel('Meddelande', { exact: true })
      .fill('Jag är intresserad av en bockmaskin.');
    await page.getByRole('button', { name: 'Skicka' }).click();
    await expect(page.getByText('Tack! Vi har tagit emot ditt meddelande')).toBeVisible();

    // This test writes a real row via the real Server Action (there's no
    // mock DB) — clean it up so CI runs don't pile up fake leads in the
    // production inquiries table.
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, { prepare: false });
      await sql`delete from inquiries where email = ${TEST_EMAIL}`;
      await sql.end();
    }
  });
});
