import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("displays hero section with search bar", async ({ page }) => {
    await page.goto("/fr");

    // Hero section should be visible
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    // Search bar should be present
    const searchInput = page.getByRole("combobox").or(
      page.getByPlaceholder(/rechercher|wilaya/i)
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test("displays featured listings with tabs", async ({ page }) => {
    await page.goto("/fr");

    // Look for listing type tabs (Vente, Location, Vacances)
    const tabs = page.getByRole("tab").or(
      page.locator("button").filter({ hasText: /vente|location|vacances/i })
    );

    const tabCount = await tabs.count();
    if (tabCount > 0) {
      // Click each tab and verify it responds
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        await tabs.nth(i).click();
        await expect(tabs.nth(i)).toBeVisible();
      }
    }
  });

  test("displays stats section", async ({ page }) => {
    await page.goto("/fr");

    // Stats section should contain numbers
    const statsSection = page.locator("[data-section='stats']").or(
      page.locator("section").filter({ hasText: /annonces|agences|wilayas/i })
    );

    await expect(statsSection.first()).toBeVisible();
  });

  test("navigation links are functional", async ({ page }) => {
    await page.goto("/fr");

    // Header navigation should be present
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();

    // Check that key navigation links exist
    const searchLink = page.getByRole("link", { name: /rechercher|search/i }).first();
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await expect(page).toHaveURL(/search/);
    }
  });

  test("page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/fr");
    await page.waitForLoadState("networkidle");

    // No critical JS errors
    expect(errors.length).toBe(0);
  });

  test("CTA Pro section is visible", async ({ page }) => {
    await page.goto("/fr");

    // Scroll to bottom to ensure CTA section loads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Look for the Pro CTA
    const ctaSection = page.locator("section").filter({
      hasText: /agence|aqarpro|digitalisez/i,
    });

    if (await ctaSection.first().isVisible()) {
      const proLink = ctaSection.first().getByRole("link").first();
      await expect(proLink).toBeVisible();
    }
  });
});
