import { test, expect } from "@playwright/test";

async function startMock(page: import("@playwright/test").Page) {
  await page.goto("/mock");
  await page.getByRole("button", { name: /i can hear it/i }).click();
  await page.getByRole("button", { name: /enable microphone/i }).click();
  await page.getByLabel(/i understand.*one sitting/i).check();
  await page.getByRole("button", { name: /start the mock/i }).click();
  await expect(page).toHaveURL(/\/mock\/run/);
}

test.describe("Test player", () => {
  test("sits the mock through all four sections to results", async ({ page }) => {
    await startMock(page);

    await expect(page.getByText(/section 1 of 4/i)).toBeVisible();
    await page.getByRole("button", { name: /next section/i }).click();
    await expect(page.getByText(/section 2 of 4/i)).toBeVisible();
    await page.getByRole("button", { name: /next section/i }).click();
    await expect(page.getByText(/section 3 of 4/i)).toBeVisible();
    await page.getByRole("button", { name: /next section/i }).click();
    await expect(page.getByText(/section 4 of 4/i)).toBeVisible();

    await page.getByRole("button", { name: /finish mock/i }).click();
    await expect(page).toHaveURL(/\/mock\/results/);

    // Results: objective score shown, W/S pending, review available
    await expect(page.getByText(/objective score/i)).toBeVisible();
    await expect(page.getByText(/pending review/i)).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /review answers/i })
    ).toBeVisible();
  });

  test("listening plays once; writing counts words", async ({ page }) => {
    await startMock(page);
    await expect(page.getByText(/section 1 of 4/i)).toBeVisible();

    await page.getByRole("button", { name: /play audio/i }).click();
    await expect(
      page.getByRole("button", { name: /playing|audio finished/i })
    ).toBeDisabled();

    // advance to Writing (section 3)
    await page.getByRole("button", { name: /next section/i }).click();
    await page.getByRole("button", { name: /next section/i }).click();
    await expect(page.getByText(/section 3 of 4/i)).toBeVisible();

    await page.getByLabel(/response for task1/i).fill("one two three four five");
    await expect(page.getByTestId("wordcount").first()).toContainText(
      "5 words"
    );
  });

  test("autosaves an answer across a reload (resume)", async ({ page }) => {
    await startMock(page);
    await expect(page.getByText(/section 1 of 4/i)).toBeVisible();

    // The radio is a visually-hidden input behind a styled label; users click
    // the label, so drive it with force from the test.
    const optionB = page.getByRole("radio", { name: "B" }).first();
    await optionB.check({ force: true });
    await expect(optionB).toBeChecked();

    await page.reload();
    await expect(page.getByRole("radio", { name: "B" }).first()).toBeChecked();
  });
});
