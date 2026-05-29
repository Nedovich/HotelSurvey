import { expect, test } from "@playwright/test";

test("public verify screen renders", async ({ page }) => {
  await page.goto("/s/check-out-feedback/verify");

  await expect(page.getByText("Verify your stay")).toBeVisible();
  await expect(page.getByLabel("Oda numarasi")).toBeVisible();
});
