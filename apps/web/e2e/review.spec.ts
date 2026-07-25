import { test, expect } from "@playwright/test";

async function startMock(page: import("@playwright/test").Page) {
  await page.goto("/mock");
  await page.getByRole("button", { name: /i can hear it/i }).click();
  await page.getByRole("button", { name: /enable microphone/i }).click();
  await page.getByLabel(/i understand.*one sitting/i).check();
  await page.getByRole("button", { name: /start the mock/i }).click();
  await expect(page).toHaveURL(/\/mock\/run/);
}

test("review shows correctness and the band criteria after a sitting", async ({
  page,
}) => {
  await startMock(page);

  // Answer reading Q7 correctly (TRUE) after advancing to Reading.
  await page.getByRole("button", { name: /next section/i }).click(); // → Reading
  await expect(page.getByText(/section 2 of 4/i)).toBeVisible();
  await page
    .getByRole("radio", { name: /^true$/i })
    .first()
    .check({ force: true });

  // Finish the rest.
  await page.getByRole("button", { name: /next section/i }).click(); // → Writing
  await page.getByRole("button", { name: /next section/i }).click(); // → Speaking
  await page.getByRole("button", { name: /finish mock/i }).click();
  await expect(page).toHaveURL(/\/mock\/results/);

  await page.getByRole("link", { name: /review answers/i }).click();
  await expect(page).toHaveURL(/\/mock\/review/);

  await expect(page.getByLabel("correct").first()).toBeVisible();
  await expect(page.getByText(/coherence & cohesion/i).first()).toBeVisible();
  await expect(page.getByText(/pronunciation/i).first()).toBeVisible();
});
