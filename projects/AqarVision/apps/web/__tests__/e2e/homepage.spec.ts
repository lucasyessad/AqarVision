import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads with hero and search bar", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("h1")).toContainText("chez-vous");
    await expect(page.locator('input[placeholder*="Ville"]')).toBeVisible();
  });

  test("transaction pills are clickable", async ({ page }) => {
    await page.goto("/fr");
    const louerBtn = page.getByRole("button", { name: /Louer/i });
    await louerBtn.click();
    await expect(louerBtn).toHaveClass(/bg-amber-500/);
  });

  test("search navigates with filters", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("button", { name: /Rechercher/i }).click();
    await expect(page).toHaveURL(/\/fr\/search/);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/fr");
    await page.getByRole("link", { name: /Agences/i }).click();
    await expect(page).toHaveURL(/\/fr\/agences/);
  });
});
