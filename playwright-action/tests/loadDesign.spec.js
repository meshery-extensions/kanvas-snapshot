const { test } = require("./fixtures");
const { expect } = require("@playwright/test");
const { TIME, canvasContainer } = require("./constants");
const {
  beforeEachCallbackForCustomUrl,
  waitFor,
} = require("./helpers");

const getDesignId = () => {
  return (process.env.CYPRESS_applicationId || "").replace(/['"]+/g, "");
};

const waitForDesignRender = async (page) => {
  await waitFor(page, canvasContainer.query, { timeout: 60000 });
  await page.waitForTimeout(TIME.X4LARGE * 2);
};

const snapshotPath = (designId, theme) => {
  // Playwright screenshot path is relative to the test file or configured output dir
  // We'll return a filename that Playwright can use
  return `snapshot-${theme}.png`;
};

const captureSnapshot = async ({ page, designId, theme }) => {
  console.log("Taking snapshot", designId, theme);
  
  await page.evaluate(() => {
    const cytoscape = window.cyto;
    if (cytoscape) {
      cytoscape.fit();
      cytoscape.center();
    }
  });

  const path = snapshotPath(designId, theme);
  await page.waitForTimeout(2000);

  const main = page.locator("main");
  await expect(main).toBeVisible({ timeout: 10000 });
  
  await main.screenshot({
    path: `cypress/screenshots/${path}`, // Mimic Cypress output structure if needed, or just let Playwright handle it
    scale: "css", // Playwright default is 'css' (device pixels), Cypress 'scale: true' likely means match viewport
  });
  
  console.log(`Snapshot taken at ${path}`);
};

["light", "dark"].forEach((theme) => {
  test(`Infra Shot Automated Runner ${theme} Mode`, async ({ page, login, setReleaseTag, setMode, setThemeMode, dpiAndResize }) => {
    // Setup is handled by fixtures and helper
    await beforeEachCallbackForCustomUrl(
      { login, setReleaseTag, setMode, setThemeMode, dpiAndResize }, // Pass fixtures as object to helper if needed, or helper calls them on 'test' object
      page,
      `/extension/meshmap?mode=design&design=${getDesignId()}&render=full`,
      theme
    );

    const designId = getDesignId();
    await waitForDesignRender(page);
    
    await page.waitForTimeout(TIME.XLARGE);
    
    await captureSnapshot({
      page,
      designId,
      theme,
    });
  });
});
