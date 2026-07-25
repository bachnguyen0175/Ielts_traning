import { test, expect } from "@playwright/test";

test.describe("Onboarding (/start)", () => {
  test("guest can set a goal and reach the test library", async ({ page }) => {
    await page.goto("/start");
    await expect(
      page.getByRole("heading", { name: /set you up/i })
    ).toBeVisible();

    await page.getByLabel(/target band/i).selectOption("7.5");
    await page.getByLabel(/test date/i).fill("2026-09-01");
    await page.getByRole("button", { name: /start a mock/i }).click();

    await expect(page).toHaveURL(/\/tests$/);
    await expect(
      page.getByRole("heading", { name: /test library/i })
    ).toBeVisible();
  });

  test("skip goes straight to the test library", async ({ page }) => {
    await page.goto("/start");
    await page.getByRole("button", { name: /skip/i }).click();
    await expect(page).toHaveURL(/\/tests$/);
  });

  test("loads with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/start");
    await page.waitForLoadState("networkidle");
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
});
