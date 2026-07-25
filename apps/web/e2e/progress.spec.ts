import { test, expect } from "@playwright/test";

async function completeMock(page: import("@playwright/test").Page) {
  await page.goto("/mock");
  await page.getByRole("button", { name: /i can hear it/i }).click();
  await page.getByRole("button", { name: /enable microphone/i }).click();
  await page.getByLabel(/i understand.*one sitting/i).check();
  await page.getByRole("button", { name: /start the mock/i }).click();
  await expect(page).toHaveURL(/\/mock\/run/);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /next section/i }).click();
  }
  await page.getByRole("button", { name: /finish mock/i }).click();
  await expect(page).toHaveURL(/\/mock\/results/);
}

test.describe("Progress", () => {
  test("empty state before any attempt", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.getByText(/no mocks yet/i)).toBeVisible();
  });

  test("lists a completed attempt and offers a retake", async ({ page }) => {
    await completeMock(page);
    await page.getByRole("link", { name: /your progress/i }).click();
    await expect(page).toHaveURL(/\/progress/);

    await expect(page.getByText(/attempt history/i)).toBeVisible();
    await expect(page.getByText(/band \d/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start a new mock/i })
    ).toBeVisible();
  });
});
