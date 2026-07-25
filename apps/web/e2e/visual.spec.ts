import { test } from "@playwright/test";

const DIR =
  process.env.SHOT_DIR ??
  "/tmp/claude-1000/-home-bachnd-Ielts-traning/678ea2ba-1dda-4fb3-99bb-903eb121e204/scratchpad/shots2";

test("capture the mock-flow screens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });

  await page.goto("/start");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/start.png`, fullPage: true });

  // test library
  await page.getByRole("button", { name: /skip/i }).click();
  await page.waitForURL(/\/tests$/);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/tests.png`, fullPage: true });

  // pre-test
  await page.getByRole("link", { name: /start composed sample/i }).click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/pretest.png`, fullPage: true });

  // player
  await page.getByRole("button", { name: /i can hear it/i }).click();
  await page.getByRole("button", { name: /enable microphone/i }).click();
  await page.getByLabel(/i understand.*one sitting/i).check();
  await page.getByRole("button", { name: /start the mock/i }).click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/player-listening.png`, fullPage: true });

  // reading (highlightable)
  await page.getByRole("button", { name: /next section/i }).click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/player-reading.png`, fullPage: true });

  // finish → results
  await page.getByRole("button", { name: /next section/i }).click();
  await page.getByRole("button", { name: /next section/i }).click();
  await page.getByRole("button", { name: /finish mock/i }).click();
  await page.waitForURL(/\/mock\/results/);
  await page.getByText(/objective score/i).waitFor();
  await page.screenshot({ path: `${DIR}/results.png`, fullPage: true });

  // review
  await page.getByRole("link", { name: /review answers/i }).click();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/review.png`, fullPage: true });

  // progress
  await page.goto("/progress");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${DIR}/progress.png`, fullPage: true });
});
