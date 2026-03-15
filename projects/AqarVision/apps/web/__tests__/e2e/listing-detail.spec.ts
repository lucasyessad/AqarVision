import { test, expect } from "@playwright/test";

test.describe("Page listing detail /l/[slug]", () => {
  test("retourne 404 pour un slug inexistant", async ({ page }) => {
    const response = await page.goto("/fr/l/slug-qui-nexiste-pas-xyz-123");

    // Next.js peut retourner soit un status 404 directement,
    // soit afficher une page 404 avec un status 200 (SSR avec notFound())
    const status = response?.status();
    const isNotFound = status === 404 || status === 200;
    expect(isNotFound).toBe(true);

    if (status === 200) {
      // Si la page est rendue côté serveur, vérifier que le contenu indique un 404
      const pageContent = await page.textContent("body");
      const has404Indicator =
        pageContent?.includes("404") ||
        pageContent?.toLowerCase().includes("introuvable") ||
        pageContent?.toLowerCase().includes("not found") ||
        pageContent?.toLowerCase().includes("page introuvable");

      expect(has404Indicator).toBe(true);
    }
  });

  // Test skippé : nécessite un slug réel présent dans la base de données.
  // Pour activer ce test, récupérer un slug valide depuis Supabase (table listings)
  // et le passer en variable d'environnement ou en fixture Playwright.
  test.skip("charge correctement une page listing valide", async ({ page }) => {
    // Remplacer par un slug réel existant en DB
    const validSlug = process.env.TEST_LISTING_SLUG ?? "appartement-alger-centre-exemple";

    const response = await page.goto(`/fr/l/${validSlug}`);

    expect(response?.status()).toBe(200);

    // La page doit contenir les éléments clés d'une fiche listing
    await expect(page.locator("h1")).toBeVisible();

    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Application error");
  });
});
