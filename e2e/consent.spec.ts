import { test, expect } from "@playwright/test";

test.describe("cookie consent network", () => {
  test("reject keeps GA off across navigation", async ({ page }) => {
    const gaRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (
        url.includes("googletagmanager.com") ||
        url.includes("google-analytics.com") ||
        url.includes("/g/collect")
      ) {
        gaRequests.push(url);
      }
    });

    await page.goto("/");
    await page.getByRole("button", { name: /Reject non-essential/i }).click();
    // Clear any requests that fired before reject (opt-out loads GA until refuse).
    gaRequests.length = 0;
    await page.goto("/search");
    await page.goto("/my-spools");
    await page.goto("/docs/slicers");

    expect(gaRequests).toEqual([]);
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === "_ga" || c.name.startsWith("_ga_"))).toBe(
      false,
    );
  });

  test("without measurement id, first visit still does not load GA", async ({
    page,
  }) => {
    // Local/e2e typically has no NEXT_PUBLIC_GA_MEASUREMENT_ID.
    const gaRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("googletagmanager.com")) gaRequests.push(req.url());
    });
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(gaRequests).toEqual([]);
  });
});
