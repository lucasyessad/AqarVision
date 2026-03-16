import { test, expect } from "@playwright/test";

test.describe("Listing Detail", () => {
  test("shows 404 for non-existent listing", async ({ page }) => {
    const response = await page.goto("/fr/annonce/this-does-not-exist-12345");
    expect(response?.status()).toBe(404);
  });

  test("loads a real listing", async ({ page }) => {
    // First get a listing slug from search
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");
    const firstLink = page.locator('a[href*="/annonce/"]').first();
    if (await firstLink.isVisible()) {
      await firstLink.click();
      await expect(page.locator("h1")).toBeVisible();
      // Price should be visible
      await expect(page.getByText(/DA/)).toBeVisible();
    }
  });
});
