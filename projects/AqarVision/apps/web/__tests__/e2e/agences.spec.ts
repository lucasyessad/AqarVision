import { test, expect } from "@playwright/test";

test.describe("Agences", () => {
  test("lists agencies with search", async ({ page }) => {
    await page.goto("/fr/agences");
    await expect(page.getByText(/agence/i).first()).toBeVisible();
    // Search input exists
    await expect(page.locator('input[placeholder*="Nom"]')).toBeVisible();
  });

  test("filter verified only", async ({ page }) => {
    await page.goto("/fr/agences");
    await page.getByRole("button", { name: /Vérifiées/i }).click();
    // Should filter to verified only
    await expect(page.getByText(/Vérifiée/i).first()).toBeVisible();
  });
});
