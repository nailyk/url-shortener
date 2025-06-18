import { test, expect } from "@playwright/test";

test.describe("URL Shortener E2E", () => {
  test("should create a short URL and show it", async ({ page }) => {
    await page.goto("/");

    const customAlias = generateRandomAlias();
    // Fill the form
    await page.fill('input[name="url"]', "https://openai.com");
    await page.fill('input[name="customAlias"]', customAlias);
    await page.fill('input[name="expiresIn"]', "1d");

    // Submit
    await page.click('button[type="submit"]');

    const shortUrlLink = page.locator('a[name="shortUrl"]');
    await expect(shortUrlLink).toBeVisible();

    // Check that the href matches your expected short URL
    await expect(shortUrlLink).toHaveAttribute(
      "href",
      `http://localhost:3000/${customAlias}`,
    );

    // Optionally, check the link text
    await expect(shortUrlLink).toHaveText(
      `http://localhost:3000/${customAlias}`,
    );
  });
});

function generateRandomAlias(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
