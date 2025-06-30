import { expect, test } from "@playwright/test";

/**
 * Generates a random alias for testing.
 */
function generateRandomAlias(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Helper to create a short URL and return its alias.
 */
async function createShortUrl(
  page,
  url = "https://openai.com",
): Promise<string> {
  const customAlias = generateRandomAlias();
  await page.click('button:has-text("Shorten URL")');
  await page.fill('input[name="url"]', url);
  await page.fill('input[name="customAlias"]', customAlias);
  await page.fill('input[name="expiresIn"]', "1d");
  await page.click('button[type="submit"]');
  return customAlias;
}

test.describe("URL Shortener E2E", () => {
  test("should create and display a short URL", async ({ page }) => {
    await page.goto("/");

    // Get initial card count
    await page.click('button:has-text("My URLs")');
    const cards = page.locator(".url-card");
    const initialCount = await cards.count();

    // Create a new short URL
    const customAlias = await createShortUrl(page);

    // Verify the short URL is shown after creation
    const shortUrlLink = page.locator("#shortUrl");
    await expect(shortUrlLink).toBeVisible();
    await expect(shortUrlLink).toHaveAttribute(
      "href",
      `http://localhost:3000/${customAlias}`,
    );
    await expect(shortUrlLink).toHaveText(
      `http://localhost:3000/${customAlias}`,
    );

    // Go to "My URLs" and verify the new card is present
    await page.click('button:has-text("My URLs")');
    await expect(cards).toHaveCount(initialCount + 1);

    const newCard = cards.filter({ hasText: customAlias }).first();
    await expect(newCard).toBeVisible();
    await expect(
      newCard.locator(".url-label", { hasText: "Original URL" }),
    ).toBeVisible();
    await expect(
      newCard.locator(".url-label", { hasText: "Short URL" }),
    ).toBeVisible();
    await expect(newCard.locator(".url-link.url-short")).toBeVisible();
  });

  test("should delete a short URL", async ({ page }) => {
    await page.goto("/");

    // Create a new short URL to delete
    const customAlias = await createShortUrl(page);

    // Go to "My URLs" and find the card
    await page.click('button:has-text("My URLs")');
    const cards = page.locator(".url-card");
    const cardToDelete = cards.filter({ hasText: customAlias }).first();

    await expect(cardToDelete).toBeVisible();
    await cardToDelete.locator(".app-button-delete").click();

    // Handle confirmation modal if present
    const confirmButton = page.locator(".modal .app-button-delete");
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify the card is deleted
    await expect(cards.filter({ hasText: customAlias })).toHaveCount(0);
  });
});
