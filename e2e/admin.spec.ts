import { expect, test } from '@playwright/test';

const email = process.env.ADMIN_TEST_EMAIL;
const password = process.env.ADMIN_TEST_PASSWORD;

test.describe('Admin', () => {
  test.skip(!email || !password, 'ADMIN_TEST_EMAIL/PASSWORD not set');

  test('redirects unauthenticated visitors to login', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.url()).toContain('/admin/login');
  });

  test('can log in, view the dashboard, and log out', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('E-post', { exact: true }).fill(email!);
    await page.getByLabel('Lösenord', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Logga in' }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole('heading', { name: 'Beställningar / offertförfrågningar' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kontaktförfrågningar' })).toBeVisible();

    await page.getByRole('button', { name: 'Logga ut' }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test('unauthenticated visitor cannot reach the pricing page', async ({ page }) => {
    const response = await page.goto('/admin/priser');
    expect(response?.url()).toContain('/admin/login');
  });
});
