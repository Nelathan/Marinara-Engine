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

test("desktop shortcut opens an empty focused command palette", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "The keyboard shortcut is covered on desktop.");

  await page.keyboard.press("Control+k");

  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  const input = omnibar.getByRole("combobox", { name: "Search Marinara" });
  await expect(omnibar.getByRole("dialog", { name: "Search Marinara" })).toBeVisible();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await expect(omnibar.getByRole("option")).toHaveCount(0);
  await expect(omnibar.locator('[data-component="GlobalOmnibar.ProfessorAssistantSprite"]')).toBeVisible();
  await expect(omnibar.locator('[data-component="GlobalOmnibar.ProfessorAssistantBubble"]')).toBeVisible();
});

test("desktop command result navigates directly to Appearance settings", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Direct command navigation is covered on desktop.");

  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await omnibar.getByRole("combobox", { name: "Search Marinara" }).fill("Appearance");
  await omnibar.getByRole("option", { name: /^Appearance Settings$/ }).click();

  await expect(omnibar).toBeHidden();
  await expect(page.getByRole("tab", { name: "Appearance", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("Ask Professor Mari opens her Home tab with an unsent draft", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("desktop"), "Professor Mari command behavior is covered on desktop.");

  const draft = "Help me choose a character for a mystery scene";
  await page.keyboard.press("Control+k");
  const omnibar = page.locator('[data-component="GlobalOmnibar"]');
  await omnibar.getByRole("combobox", { name: "Search Marinara" }).fill(draft);
  await omnibar.getByRole("option", { name: /^Ask Professor Mari Professor Mari$/ }).click();

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
  await expect(omnibar.locator('[data-component="GlobalOmnibar.ProfessorAssistantSprite"]')).toBeVisible();
  const panelBox = await panel.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(panelBox!.x).toBeGreaterThanOrEqual(0);
  expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(390);
});
