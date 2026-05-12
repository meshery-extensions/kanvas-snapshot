const { test, expect } = require("@playwright/test");

/**
 * Kanvas Snapshot Playwright Rewrite
 * Replicates the logic from Cypress loadDesign.js
 */

const designId = (process.env.CYPRESS_applicationId || process.env.APPLICATION_ID || "").replace(/['"]+/g, "");
const token = process.env.CYPRESS_token || process.env.MESHERY_TOKEN;
const theme = process.env.THEME || "light";

test.describe("Kanvas Snapshot Automated Runner", () => {
  test.beforeEach(async ({ context, page }) => {
    // Set cookies for authentication - mirroring cy.login()
    // Using playground.meshery.io as the default target domain
    const domain = "playground.meshery.io";
    
    await context.addCookies([
      { name: "meshery-provider", value: "Layer5", domain: domain, path: "/" },
      { name: "token", value: token, domain: domain, path: "/" },
    ]);

    // Set local storage for theme and mode - mirroring cy.setMode and cy.setThemeMode
    await page.addInitScript((t) => {
      window.localStorage.setItem("Theme", t);
      window.localStorage.setItem("mode", "designer");
    }, theme);
  });

  test(`Capture Kanvas Snapshot - ${theme} mode`, async ({ page }) => {
    // The path used in the Cypress version
    const url = `https://playground.meshery.io/extension/meshmap?mode=design&design=${designId}&render=full`;
    
    console.log(`Navigating to: ${url}`);
    
    // Navigate and wait for initial load
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the canvas container to exist and be visible
    // This mirrors the waitForDesignRender in Cypress
    const canvasSelector = "#canvas-container";
    await page.waitForSelector(canvasSelector, { state: 'visible', timeout: 60000 });
    
    // Give it some extra time for the Cytoscape graph to stabilize
    // Cypress used X4LARGE * 2 which is quite long
    await page.waitForTimeout(10000);

    // Manipulate the Cytoscape instance directly in the browser context
    // Mirroring captureSnapshot in Cypress
    await page.evaluate(() => {
      if (window.cyto) {
        window.cyto.fit();
        window.cyto.center();
        console.log("Cytoscape fit and centered");
      } else {
        console.warn("window.cyto not found!");
      }
    });

    // Take the screenshot of the main element
    const path = `snapshot-${theme}.png`;
    
    // We target the 'main' element as in the original Cypress script
    await page.locator("main").screenshot({ 
      path: path,
      scale: "css" // Ensuring we capture at high resolution if configured
    });
    
    console.log(`Snapshot successfully saved to ${path}`);
  });
});
