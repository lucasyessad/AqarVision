import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("affiche le formulaire de connexion sur /auth/login", async ({
    page,
  }) => {
    const response = await page.goto("/fr/AqarChaab/auth/login");

    // Vérifier que la page se charge correctement
    expect(response?.status()).toBe(200);

    // Vérifier la présence d'un champ email
    const emailInput = page.locator(
      "input[type='email'], input[name='email'], input[placeholder*='email' i], input[autocomplete='email']"
    );
    await expect(emailInput.first()).toBeVisible();

    // Vérifier la présence d'un bouton de soumission
    const submitButton = page.locator(
      "button[type='submit'], input[type='submit'], button:has-text('Connexion'), button:has-text('Se connecter'), button:has-text('Login')"
    );
    await expect(submitButton.first()).toBeVisible();
  });

  test("affiche une erreur pour des identifiants invalides", async ({
    page,
  }) => {
    await page.goto("/fr/AqarChaab/auth/login");

    // Remplir le champ email avec un identifiant invalide
    const emailInput = page.locator(
      "input[type='email'], input[name='email'], input[autocomplete='email']"
    );
    await emailInput.first().fill("invalid@test.com");

    // Remplir le champ mot de passe avec un mot de passe incorrect
    const passwordInput = page.locator(
      "input[type='password'], input[name='password'], input[autocomplete='current-password']"
    );
    await passwordInput.first().fill("wrongpass");

    // Soumettre le formulaire
    const submitButton = page.locator(
      "button[type='submit'], input[type='submit']"
    );
    await submitButton.first().click();

    // Attendre qu'un message d'erreur soit visible
    // Les sélecteurs couvrent les patterns courants : alert, role=alert, classes d'erreur
    const errorMessage = page.locator(
      "[role='alert'], .error, .error-message, [data-testid='error'], [aria-live='assertive'], [aria-live='polite']"
    );

    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });
});
