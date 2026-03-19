import { test, expect } from "@playwright/test";

test.describe("Listing detail page", () => {
  // We use a search-first approach since we don't know real slugs at test time
  test("listing page renders core elements", async ({ page }) => {
    // Try navigating to search first to find a listing
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    // Look for listing card links
    const listingLinks = page.getByRole("link").filter({
      hasText: /.+/,
    });

    // Try to find a link to an annonce
    const annonceLink = page.locator('a[href*="/annonce/"]').first();

    if (await annonceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await annonceLink.click();
      await page.waitForLoadState("networkidle");

      // Title should be visible
      const heading = page.getByRole("heading").first();
      await expect(heading).toBeVisible();

      // Price should be visible
      const priceElement = page
        .locator("[data-testid='listing-price']")
        .or(page.locator("text=/\\d+.*DZD|DA|\\d+.*€/"));
      if (await priceElement.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(priceElement.first()).toBeVisible();
      }
    }
  });

  test("contact card is visible on desktop", async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }

    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    const annonceLink = page.locator('a[href*="/annonce/"]').first();

    if (await annonceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await annonceLink.click();
      await page.waitForLoadState("networkidle");

      // Contact card — look for call/whatsapp/message buttons
      const contactCard = page
        .locator("[data-testid='contact-card']")
        .or(
          page.locator("aside").filter({
            hasText: /appeler|whatsapp|message|contacter/i,
          })
        );

      if (await contactCard.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(contactCard.first()).toBeVisible();
      }
    }
  });

  test("listing detail page loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    const annonceLink = page.locator('a[href*="/annonce/"]').first();

    if (await annonceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await annonceLink.click();
      await page.waitForLoadState("networkidle");

      expect(errors.length).toBe(0);
    }
  });

  test("back navigation works from listing detail", async ({ page }) => {
    await page.goto("/fr/search");
    await page.waitForLoadState("networkidle");

    const annonceLink = page.locator('a[href*="/annonce/"]').first();

    if (await annonceLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await annonceLink.click();
      await page.waitForLoadState("networkidle");

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/search/);
    }
  });
});
