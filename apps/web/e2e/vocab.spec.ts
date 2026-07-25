import { test, expect } from "@playwright/test";

test.describe("Vocabulary / Flashcards (/vocab)", () => {
  test("empty state, add a word, then study it as a flashcard", async ({
    page,
  }) => {
    await page.goto("/vocab");
    await expect(page.getByText(/no words saved yet/i)).toBeVisible();

    // Add a word via the form
    await page.getByLabel("Word", { exact: true }).fill("mitigate");
    await page.getByLabel("Definition").fill("to make less severe");
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByText("mitigate")).toBeVisible();
    await expect(page.getByText(/1 word saved/i)).toBeVisible();

    // Study it
    await page.getByRole("button", { name: /study flashcards/i }).click();
    await expect(page.getByText("mitigate")).toBeVisible();
    await expect(page.getByText("to make less severe")).toBeHidden();

    await page.getByRole("button", { name: /show definition/i }).click();
    await expect(page.getByText("to make less severe")).toBeVisible();
    await page.getByRole("button", { name: /got it/i }).click();

    await expect(page.getByText(/session complete/i)).toBeVisible();
  });

  test("load example words to demo the deck", async ({ page }) => {
    await page.goto("/vocab");
    await page.getByRole("button", { name: /load example words/i }).click();
    await expect(page.getByText(/6 words saved/i)).toBeVisible();
    await expect(page.getByText("ubiquitous")).toBeVisible();
  });
});
