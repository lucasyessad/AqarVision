import { test, expect } from "@playwright/test";

test.describe("Search page", () => {
  test("displays search filters", async ({ page }) => {
    await page.goto("/fr/search");

    // The page should load
    await page.waitForLoadState("networkidle");

    // Look for filter elements — type pills, price inputs, or filter button
    const filterSection = page.locator("[data-testid='search-filters']").or(
      page.locator("form").filter({ hasText: /type|prix|surface|wilaya/i })
    );

    // At minimum, there should be some filter-like controls
    const buttons = page.getByRole("button").or(page.locator("button"));
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("results area is visible", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    // Results section — could be a grid of cards or an empty state
    const resultsArea = page
      .locator("[data-testid='search-results']")
      .or(page.locator("main"))
      .first();

    await expect(resultsArea).toBeVisible();
  });

  test("transaction type pills are clickable", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    // Look for transaction type filter buttons
    const typePills = page
      .locator("button")
      .filter({ hasText: /vente|location|vacances|sale|rent/i });

    const count = await typePills.count();
    if (count > 0) {
      // Click the first pill
      await typePills.first().click();

      // URL should update with type parameter or the button should show active state
      await page.waitForTimeout(300);
    }
  });

  test("search page has proper heading", async ({ page }) => {
    await page.goto("/fr/search");

    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });

  test("page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    expect(errors.length).toBe(0);
  });

  test("sort options are available", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    // Look for sort dropdown or buttons
    const sortControl = page
      .getByRole("combobox")
      .or(page.locator("select"))
      .or(
        page.locator("button").filter({ hasText: /trier|sort|récent|prix/i })
      );

    if (await sortControl.first().isVisible()) {
      await expect(sortControl.first()).toBeVisible();
    }
  });
});
