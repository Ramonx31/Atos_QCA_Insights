import { expect, test } from "@playwright/test";

test("dashboard autenticado filtra atos e exporta somente o conjunto visível", async ({ page }) => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, "Defina PLAYWRIGHT_BASE_URL para executar contra ambiente autenticado.");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard de atos" })).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar Atos" }).fill("Visível");
  await page.getByRole("checkbox", { name: "Visível" }).check();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar HTML" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("dashboard-atos.html");
});
