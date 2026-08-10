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
    await page.goto("/search");
    await page.goto("/my-spools");
    await page.goto("/docs/slicers");

    expect(gaRequests).toEqual([]);
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === "_ga" || c.name.startsWith("_ga_"))).toBe(
      false,
    );
  });

  test("accept loads GA only when measurement id configured", async ({ page }) => {
    // Without NEXT_PUBLIC_GA_MEASUREMENT_ID, accept must still not load GA.
    const gaRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("googletagmanager.com")) gaRequests.push(req.url());
    });
    await page.goto("/");
    await page.getByRole("button", { name: /Accept all/i }).click();
    await page.waitForTimeout(500);
    expect(gaRequests).toEqual([]);
  });
});
