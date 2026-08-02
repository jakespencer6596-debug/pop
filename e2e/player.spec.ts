import { expect, test } from "@playwright/test";

const PLAYER_PASSWORD = process.env.PLAYER_PASSWORD ?? "popplayer";

test("player tier is read-only and lands on the player home", async ({
  page,
}) => {
  // Log in with the player password.
  await page.goto("/login");
  await page.getByLabel("Password").fill(PLAYER_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/player$/);
  await expect(page.getByText("Player view")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();

  // The seeded demo event is listed with its public links.
  await expect(page.getByText("POP Test Event")).toBeVisible();
  await page.getByRole("link", { name: "Live scoreboard" }).last().click();
  await page.waitForURL(/\/live\//);
  await expect(page.getByText("Round 1 standings")).toBeVisible();

  // Admin pages redirect the player back to their home.
  await page.goto("/");
  await page.waitForURL(/\/player$/);
  await page.goto("/new");
  await page.waitForURL(/\/player$/);

  // Mutations are refused for the player session.
  const create = await page.request.post("/api/tournaments", {
    data: { name: "Player Should Not Create" },
  });
  expect(create.status()).toBe(401);
  const list = await page.request.get("/api/tournaments");
  expect(list.status()).toBe(401);

  // Logging out returns to the login page.
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(/\/login$/);
});

test("wrong password is rejected", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password").fill("definitely-wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Wrong password.")).toBeVisible();
});
