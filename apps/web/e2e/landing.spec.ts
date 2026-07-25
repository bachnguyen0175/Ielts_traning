import { test, expect } from "@playwright/test";

test.describe("Landing page (live)", () => {
  test("renders the hero promise and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /sit the real test/i })
    ).toBeVisible();
    const cta = page.getByRole("link", { name: /start a free mock/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/start");
  });

  test("shows the four skills and the differentiator conditions", async ({
    page,
  }) => {
    await page.goto("/");
    for (const skill of ["Listening", "Reading", "Writing", "Speaking"]) {
      await expect(
        page.getByRole("heading", { name: skill, exact: true })
      ).toBeVisible();
    }
    await expect(page.getByText(/audio plays once/i)).toBeVisible();
  });

  test("primary CTA navigates to the onboarding flow", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /start a free mock/i }).first().click();
    await expect(page).toHaveURL(/\/start$/);
    await expect(
      page.getByRole("heading", { name: /set you up/i })
    ).toBeVisible();
  });

  const SHOT_DIR =
    process.env.SHOT_DIR ??
    "/tmp/claude-1000/-home-bachnd-Ielts-traning/678ea2ba-1dda-4fb3-99bb-903eb121e204/scratchpad/shots";

  test("captures light + dark screenshots for visual verification", async ({
    page,
  }) => {
    // reducedMotion: our CSS reveals all content immediately under reduced
    // motion, which is exactly what we want for a full-page visual capture.
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOT_DIR}/landing-light.png`, fullPage: true });

    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOT_DIR}/landing-dark.png`, fullPage: true });

    // Also grab a viewport-only hero shot (light) for a quick visual gut-check.
    await page.emulateMedia({ colorScheme: "light" });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOT_DIR}/hero-light.png` });

    // Mobile (375px) full-page to verify responsive layout.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SHOT_DIR}/landing-mobile.png`, fullPage: true });
  });

  test("loads with no console errors or hydration warnings", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Give React a beat to hydrate before asserting.
    await page.waitForTimeout(300);

    const hydrationErrors = errors.filter((e) => /hydrat/i.test(e));
    expect(hydrationErrors, hydrationErrors.join("\n")).toHaveLength(0);
    expect(errors, errors.join("\n")).toHaveLength(0);
  });

  test("has no horizontal overflow on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
