import { test, expect } from "@playwright/test";

test.describe("Test library (/tests)", () => {
  test("lists tests and starting one opens its pre-test", async ({ page }) => {
    await page.goto("/tests");
    await expect(
      page.getByRole("heading", { name: /test library/i })
    ).toBeVisible();

    // Start the sample mock → pre-test carries the selected test.
    await page
      .getByRole("link", { name: /start composed sample/i })
      .click();
    await expect(page).toHaveURL(/\/mock\?test=sample-academic-1/);
    await expect(
      page.getByRole("heading", { name: /academic mock 1/i })
    ).toBeVisible();
  });
});
