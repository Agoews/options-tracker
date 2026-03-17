import { test, expect } from "@playwright/test";

test("landing page renders marketing headline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Journal the entire options lifecycle/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open workspace/i })).toBeVisible();
});
