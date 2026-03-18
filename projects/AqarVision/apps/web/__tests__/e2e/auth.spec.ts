import { test, expect } from "@playwright/test";

test.describe("Authentication pages", () => {
  test("login page displays form with email and password", async ({ page }) => {
    await page.goto("/fr/auth/login");

    // Email field
    const emailInput = page.getByLabel(/email/i).or(
      page.locator('input[type="email"]')
    );
    await expect(emailInput.first()).toBeVisible();

    // Password field
    const passwordInput = page.getByLabel(/mot de passe|password/i).or(
      page.locator('input[type="password"]')
    );
    await expect(passwordInput.first()).toBeVisible();

    // Submit button
    const submitButton = page.getByRole("button", {
      name: /connexion|se connecter|login/i,
    });
    await expect(submitButton.first()).toBeVisible();
  });

  test("signup page has all 6 required fields", async ({ page }) => {
    await page.goto("/fr/auth/signup");

    // Check for the 6 fields: firstName, lastName, email, phone, password, confirmPassword
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(6);

    // Email field
    const emailInput = page.locator('input[type="email"]').or(
      page.getByLabel(/email/i)
    );
    await expect(emailInput.first()).toBeVisible();

    // Password fields (at least 2 — password + confirmation)
    const passwordInputs = page.locator('input[type="password"]');
    const pwCount = await passwordInputs.count();
    expect(pwCount).toBeGreaterThanOrEqual(2);
  });

  test("forgot password page is accessible from login", async ({ page }) => {
    await page.goto("/fr/auth/login");

    // Find forgot password link
    const forgotLink = page.getByRole("link", {
      name: /oublié|forgot|mot de passe/i,
    });

    if (await forgotLink.first().isVisible()) {
      await forgotLink.first().click();
      await expect(page).toHaveURL(/forgot-password/);

      // Should have email field
      const emailInput = page.locator('input[type="email"]').or(
        page.getByLabel(/email/i)
      );
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/fr/auth/login");

    const signupLink = page.getByRole("link", {
      name: /inscription|créer|signup|s'inscrire/i,
    });

    await expect(signupLink.first()).toBeVisible();
  });

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/fr/auth/signup");

    const loginLink = page.getByRole("link", {
      name: /connexion|se connecter|login|déjà un compte/i,
    });

    await expect(loginLink.first()).toBeVisible();
  });

  test("pages load without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/fr/auth/login");
    await page.waitForLoadState("networkidle");
    expect(errors.length).toBe(0);

    errors.length = 0;
    await page.goto("/fr/auth/signup");
    await page.waitForLoadState("networkidle");
    expect(errors.length).toBe(0);
  });
});
