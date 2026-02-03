/**
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await emailInput.blur();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, user: { id: '1', email: 'test@example.com' } }),
      });
    });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should be keyboard accessible', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Tab through form
    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(submitButton).toBeFocused();

    // Submit with Enter
    await page.keyboard.press('Enter');
  });

  test('should pass accessibility checks', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    const toggleButton = page.getByRole('button', { name: /show password/i });

    await expect(passwordInput).toHaveAttribute('type', 'password');

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should remember me checkbox works', async ({ page }) => {
    const rememberCheckbox = page.getByLabel(/remember me/i);

    await expect(rememberCheckbox).not.toBeChecked();

    await rememberCheckbox.click();
    await expect(rememberCheckbox).toBeChecked();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL('/auth/forgot-password');
  });

  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test@example.com');
  });

  test('should show loading state during submission', async ({ page }) => {
    // Delay the response to see loading state
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for loading indicator
    await expect(page.getByRole('status')).toBeVisible();
  });
});
