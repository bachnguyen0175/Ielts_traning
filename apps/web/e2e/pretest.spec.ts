import { test, expect } from "@playwright/test";

test.describe("Pre-test readiness gate (/mock)", () => {
  test("gates Start until checks pass, then reaches the player", async ({
    page,
  }) => {
    await page.goto("/mock");
    await expect(
      page.getByRole("heading", { name: /academic mock 1/i })
    ).toBeVisible();
    await expect(page.getByText(/plays once/i)).toBeVisible();

    const start = page.getByRole("button", { name: /start the mock/i });
    await expect(start).toBeDisabled();

    await page.getByRole("button", { name: /i can hear it/i }).click();
    await page.getByRole("button", { name: /enable microphone/i }).click();
    await page.getByLabel(/i understand.*one sitting/i).check();

    await expect(start).toBeEnabled();
    await start.click();
    await expect(page).toHaveURL(/\/mock\/run/);
  });
});
