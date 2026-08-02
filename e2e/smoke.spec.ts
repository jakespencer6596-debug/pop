import { expect, test } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "popadmin";

const PLAYERS = [
  "Alex Reed",
  "Bri Cole",
  "Cal Ortiz",
  "Dev Patel",
  "Eli Stone",
  "Fay Wong",
  "Gus Marsh",
  "Hana Kim",
  "Ivo Marek",
  "Jo Banks",
  "Kai Lund",
  "Lia Costa",
  "Mo Farah",
  "Nia Bell",
  "Oz Grant",
  "Pia Sorel",
];

test("organizer can run an event end to end", async ({ page, browser }) => {
  // Log in with the shared admin password.
  await page.goto("/login");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("link", { name: "Create tournament" }),
  ).toBeVisible();

  // Create a tournament.
  await page.getByRole("link", { name: "Create tournament" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Smoke Test Event");
  await page.getByRole("button", { name: "Create tournament" }).click();
  await page.waitForURL(/\/t\/[a-z0-9]+$/);
  const tournamentId = page.url().split("/t/")[1];

  // Add 16 players.
  await page.getByRole("link", { name: "Players" }).click();
  for (const name of PLAYERS) {
    await page.getByPlaceholder("Player name").fill(name);
    await page.getByRole("button", { name: "Add player" }).click();
    await expect(page.getByText(name).first()).toBeVisible();
  }
  await expect(page.getByText("Players (16 of 16)")).toBeVisible();

  // Generate the Round 1 schedule.
  await page.getByRole("link", { name: "Schedule" }).click();
  await page.getByRole("button", { name: "Generate schedule" }).click();
  await expect(page.getByText("Round 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Round 6", { exact: true })).toBeVisible();

  // Enter and finalize one score.
  await page.getByRole("link", { name: "Scoring" }).click();
  await page
    .getByRole("textbox", { name: "Team A score", exact: true })
    .first()
    .fill("11");
  await page
    .getByRole("textbox", { name: "Team B score", exact: true })
    .first()
    .fill("7");
  await page.getByRole("button", { name: "Mark final" }).first().click();
  await expect(page.getByText("1 of 24 games final")).toBeVisible();

  // The public live page shows the event without a login.
  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  await publicPage.goto(`http://localhost:3100/live/${tournamentId}`);
  await expect(
    publicPage.getByRole("heading", { name: "Smoke Test Event" }),
  ).toBeVisible();
  await expect(publicPage.getByText("Round 1 standings")).toBeVisible();
  await publicContext.close();

  // Clean up so the test can be re-run.
  const res = await page.request.delete(`/api/tournaments/${tournamentId}`);
  expect(res.ok()).toBeTruthy();
});
