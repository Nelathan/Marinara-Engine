import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const APP_VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string }
).version;

async function prepareFreshClient(page: Page) {
  await page.addInitScript((appVersion) => {
    localStorage.setItem("marinara:whats-new:seen-version", appVersion);
    localStorage.setItem(
      "marinara-engine-ui",
      JSON.stringify({
        state: {
          hasCompletedOnboarding: true,
          rightPanelOpen: false,
          sidebarOpen: false,
        },
        version: 65,
      }),
    );
  }, APP_VERSION);
}

test.beforeEach(async ({ page }) => {
  const resetUiSettings = await page.request.put("/api/app-settings/ui", { data: { value: "" } });
  expect(resetUiSettings.ok()).toBeTruthy();
  await prepareFreshClient(page);
  await page.goto("/");
});

test("desktop shortcut opens a focused command palette with useful initial options", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "The keyboard shortcut is covered on desktop.");

  await page.keyboard.press("Control+k");

  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  const input = omnibar.getByRole("searchbox", { name: "Search Marinara" });
  await expect(omnibar.getByRole("dialog", { name: "Search Marinara" })).toBeVisible();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  const resultRows = omnibar.locator("[data-command-center-result-row]");
  await expect(resultRows.first()).toBeVisible();
  expect(await resultRows.count()).toBeLessThanOrEqual(4);
  await expect(resultRows.filter({ hasText: "Theme" })).toBeVisible();
  await expect(omnibar.locator('[data-component="GlobalOmnibar.ProfessorMariButton"]')).toBeVisible();
  await expect(omnibar.getByRole("toolbar", { name: "Result categories" })).toBeHidden();
  await expect(omnibar.getByRole("button", { name: "Browse", exact: true })).toBeVisible();
});

test("desktop command palette can toggle a setting without closing", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Setting controls are covered on desktop.");

  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await omnibar.getByRole("searchbox", { name: "Search Marinara" }).fill("reduced effects");
  await omnibar
    .locator("[data-command-center-result-row]")
    .filter({ hasText: "Reduced ambient effects" })
    .getByRole("button", { name: /Reduced ambient effects/ })
    .first()
    .click();
  await expect(omnibar.getByRole("switch", { name: "Reduced ambient effects" })).toBeVisible();
  await omnibar.getByRole("switch", { name: "Reduced ambient effects" }).click();
  await expect(omnibar).toBeVisible();
});

test("desktop command result navigates directly to Appearance settings", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Direct command navigation is covered on desktop.");

  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await omnibar.getByRole("searchbox", { name: "Search Marinara" }).fill("Appearance");
  await omnibar
    .locator("[data-command-center-result-row]")
    .filter({ hasText: "Appearance" })
    .getByRole("button", { name: /Appearance/ })
    .first()
    .click();

  await expect(omnibar).toBeHidden();
  await expect(page.getByRole("tab", { name: "Appearance", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("Professor Mari header action closes the palette and preserves an unsent draft", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Professor Mari command behavior is covered on desktop.");

  const draft = "Help me choose a character for a mystery scene";
  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await omnibar.getByRole("searchbox", { name: "Search Marinara" }).fill(draft);
  await omnibar.locator('[data-component="GlobalOmnibar.ProfessorMariButton"]').click();

  await expect(omnibar).toBeHidden();
  const professorTab = page.getByRole("tab", { name: "Professor", exact: true });
  await expect(professorTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('textarea[placeholder="Ask Professor Mari"]:visible')).toHaveValue(draft);
});

test("mobile keeps the command palette button and panel inside the top-bar layout", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "The mobile top-bar layout is covered on mobile.");

  const topBar = page.locator('[data-component="TopBar"]');
  const searchButton = topBar.getByRole("button", { name: "Search", exact: true });
  await expect(topBar).toBeVisible();
  await expect(searchButton).toBeVisible();

  const [topBarBox, searchBox] = await Promise.all([topBar.boundingBox(), searchButton.boundingBox()]);
  expect(topBarBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(searchBox!.x).toBeGreaterThanOrEqual(topBarBox!.x);
  expect(searchBox!.x + searchBox!.width).toBeLessThanOrEqual(topBarBox!.x + topBarBox!.width + 1);

  await searchButton.click();
  const panel = page.locator('[data-component="GlobalOmnibar.Panel"]');
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await expect(panel).toBeVisible();
  await expect(omnibar.locator('[data-component="GlobalOmnibar.ProfessorMariButton"]')).toBeVisible();
  const panelBox = await panel.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeCloseTo(0, 0);
  expect(panelBox!.y).toBeCloseTo(0, 0);
  expect(panelBox!.width).toBeCloseTo(390, 0);
  expect(panelBox!.height).toBeCloseTo(page.viewportSize()!.height, 0);
  await expect(omnibar.getByRole("toolbar", { name: "Result categories" })).toBeHidden();
});

test("query changes reset the command category filter to All", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Command filtering is covered on desktop.");

  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  const input = omnibar.getByRole("searchbox", { name: "Search Marinara" });
  await input.fill("theme");
  const toolbar = omnibar.getByRole("toolbar", { name: "Result categories" });
  await toolbar.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(toolbar.getByRole("button", { name: "Settings", exact: true })).toHaveAttribute("aria-pressed", "true");

  await input.fill("Appearance");
  await expect(toolbar.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(toolbar.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
});

test("browse detail shows the exact selected entity and returns to its browse position", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Browse detail is covered on desktop.");

  const firstName = `Browse Alpha ${Date.now()}`;
  const secondName = `Browse Beta ${Date.now()}`;
  const firstResponse = await page.request.post("/api/characters", { data: { data: { name: firstName } } });
  const secondResponse = await page.request.post("/api/characters", { data: { data: { name: secondName } } });
  expect(firstResponse.ok()).toBeTruthy();
  expect(secondResponse.ok()).toBeTruthy();
  const first = (await firstResponse.json()) as { id: string };
  const second = (await secondResponse.json()) as { id: string };

  try {
    await page.reload();
    await page.keyboard.press("Control+k");
    const omnibar = page.locator('[data-component="GlobalOmnibar"]');
    await omnibar.getByRole("button", { name: "Browse", exact: true }).click();
    const toolbar = omnibar.getByRole("toolbar", { name: "Result categories" });
    await toolbar.getByRole("button", { name: "Characters", exact: true }).click();
    const selectedCard = omnibar.getByRole("button", { name: new RegExp(secondName) });
    await selectedCard.click();

    const detail = omnibar.locator('[data-component="GlobalOmnibar.Detail"]');
    await expect(omnibar).toBeVisible();
    await expect(detail.getByRole("heading", { name: secondName, exact: true })).toBeVisible();
    await expect(detail.getByRole("heading", { name: firstName, exact: true })).toHaveCount(0);

    await omnibar.getByRole("button", { name: "Back to browse", exact: true }).click();
    await expect(omnibar.locator('[data-component="GlobalOmnibar.Browse"]')).toBeVisible();
    await expect(toolbar.getByRole("button", { name: "Characters", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(omnibar.getByRole("button", { name: new RegExp(secondName) })).toHaveAttribute(
      "data-selected",
      "true",
    );
    await expect(omnibar.getByRole("searchbox", { name: "Search Marinara" })).toBeFocused();
  } finally {
    await page.request.delete(`/api/characters/${first.id}`);
    await page.request.delete(`/api/characters/${second.id}`);
  }
});
