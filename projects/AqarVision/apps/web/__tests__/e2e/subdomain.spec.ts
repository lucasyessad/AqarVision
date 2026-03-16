import { test, expect } from "@playwright/test";

test.describe("Agency Subdomain", () => {
  test("loads agency vitrine via subdomain", async ({ page }) => {
    await page.goto("http://immobiliere-el-djazair.localhost:3000");
    await expect(page.getByText(/Immobilière El Djazair/i).first()).toBeVisible();
  });
});
