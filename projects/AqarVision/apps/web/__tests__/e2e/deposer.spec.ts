import { test, expect } from "@playwright/test";

test.describe("Page /deposer", () => {
  test("redirige vers login si non authentifié", async ({ page }) => {
    const response = await page.goto("/fr/deposer");

    // Attendre que la navigation de redirection soit complète
    await page.waitForURL((url) => url.pathname.includes("auth/login"));

    const finalUrl = page.url();

    // Vérifier que l'URL contient bien le segment auth/login
    expect(finalUrl).toContain("auth/login");

    // Vérifier que les query params contiennent un paramètre de redirect
    const url = new URL(finalUrl);
    const hasRedirectParam =
      url.searchParams.has("redirect") ||
      url.searchParams.has("redirectTo") ||
      url.searchParams.has("callbackUrl") ||
      url.searchParams.has("next");

    expect(hasRedirectParam).toBe(true);
  });

  // Test skippé : nécessite un compte de test réel configuré dans l'environnement.
  // Pour activer ce test, il faudrait un utilisateur de test avec des credentials
  // valides stockés dans les variables d'environnement (TEST_USER_EMAIL, TEST_USER_PASSWORD)
  // et une session authentifiée via storageState Playwright.
  test.skip("affiche le wizard si authentifié", async ({ page }) => {
    // Pré-condition : l'utilisateur doit être authentifié via storageState
    await page.goto("/fr/deposer");

    // Le wizard de dépôt d'annonce doit être visible
    await expect(page.locator("form, [data-testid='wizard']")).toBeVisible();
  });
});
