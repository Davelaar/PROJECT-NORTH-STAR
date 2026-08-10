import { test, expect } from "@playwright/test";

test.describe("My Spools Cloud prepaid copy", () => {
  test("cloud page shows one-time and no automatic renewal", async ({ page }) => {
    await page.goto("/my-spools/cloud");
    await expect(page.getByRole("heading", { name: /My Spools Cloud/i })).toBeVisible();
    await expect(page.getByText(/€19\.99 for 12 months/i).first()).toBeVisible();
    await expect(page.getByText(/One-time payment/i).first()).toBeVisible();
    await expect(page.getByText(/No automatic renewal/i).first()).toBeVisible();
    await expect(
      page.getByText(/never charge you again unless you choose to purchase another 12 months/i),
    ).toBeVisible();
    await expect(page.getByText(/Subscribe/i)).toHaveCount(0);
  });
});
