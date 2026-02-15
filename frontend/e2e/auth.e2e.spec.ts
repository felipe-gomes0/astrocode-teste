import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

    // Navigate to login page
    await page.goto('/login');

    // Fill credentials
    await page.locator('input[formControlName="email"]').fill('client@example.com');
    await page.locator('input[formControlName="password"]').fill('password123');

    // Click login
    await page.getByRole('button', { name: /entrar/i }).click();

    // Verify redirection to home/dashboard
    // Adjust expected URL based on successful login route
    await expect(page).toHaveURL('/'); // Redirects to root
    
    // Check for success message or element
    // await expect(page.getByText('Bem-vindo')).toBeVisible();
  });
});
