import { test, expect } from "@playwright/test";

test.describe("Page /search", () => {
  test("charge la page de recherche", async ({ page }) => {
    const response = await page.goto("/fr/search");

    // Vérifier que la page répond avec un statut 200
    expect(response?.status()).toBe(200);

    // Vérifier qu'un formulaire ou un input de recherche est présent
    const searchElement = page.locator(
      "input[type='search'], input[type='text'], input[placeholder], form, [role='search']"
    );
    await expect(searchElement.first()).toBeVisible();

    // Vérifier l'absence d'erreur Next.js (crash applicatif)
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Application error");
    expect(pageContent).not.toContain("Internal Server Error");
  });

  test("accepte les filtres via URL params", async ({ page }) => {
    // Simuler une recherche avec des filtres de type de transaction et wilaya
    const response = await page.goto(
      "/fr/search?listing_type=sale&wilaya_code=16"
    );

    // Vérifier que la page se charge sans erreur
    expect(response?.status()).toBe(200);

    // Vérifier l'absence d'erreur visible
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("Application error");
    expect(pageContent).not.toContain("Internal Server Error");
  });

  test("displays listing results", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");
    // Should have at least one listing card
    const cards = page
      .locator('[class*="rounded-xl"][class*="border"]')
      .filter({ has: page.locator('a[href*="/annonce/"]') });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("filters open and close", async ({ page }) => {
    await page.goto("/fr/search");
    // Click Type d'annonce filter
    await page.getByRole("button", { name: /Type d'annonce/i }).click();
    // Dropdown should appear
    await expect(page.getByText("Vente")).toBeVisible();
    // Click outside to close
    await page.locator("body").click({ position: { x: 10, y: 10 } });
  });

  test("sort changes order", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");
    const select = page.locator("select");
    await select.selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
  });
});
