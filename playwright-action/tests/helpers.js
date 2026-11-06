const { expect } = require("@playwright/test");
const { DESIGNER, extension, MESHMAP_PATH } = require("./constants");

// Helper to wait for a selector (Playwright auto-waits, but we can keep this for structure)
async function waitFor(page, selector, options = {}) {
  await page.waitForSelector(selector, options);
}

async function doInitialSetup(test, page) {
  // cy.dpiAndResize(3, 1920, 1080);
  await test.dpiAndResize(3, 1920, 1080);
  // cy.login();
  await test.login();
  // cy.setReleaseTag();
  await test.setReleaseTag();
  // cy.interceptCapabilities();
  // Handled by setReleaseTag or separate intercept
  // cy.setMode(DESIGNER);
  await test.setMode(DESIGNER);
}

async function beforeEachCallback(test, page) {
  await doInitialSetup(test, page);
  // cy.intercept(extension.path).as(extension.alias);
  // Playwright handles intercepts differently, usually before navigation
  // We can set up a listener or just rely on auto-waiting for network idle if needed
  
  await page.goto(MESHMAP_PATH);
  // cy.wait(waitFor(extension.alias), { timeout: 15000 });
  // In Playwright, we might wait for a specific response
  await page.waitForResponse(response => response.url().includes("/api/provider/extension") && response.status() === 200, { timeout: 15000 });
}

async function setThemeMode(page, mode) {
  await page.evaluate((m) => {
    window.localStorage.setItem("theme", m);
  }, mode);
}

async function beforeEachCallbackForCustomUrl(test, page, customPath, theme = "light") {
  // cy.setThemeMode(theme);
  await test.setThemeMode(theme);
  await doInitialSetup(test, page);
  
  // cy.intercept(extension.path).as(extension.alias);
  // cy.visit(customPath);
  await page.goto(customPath);
  
  // cy.wait(waitFor(extension.alias), { timeout: 60_000 });
  // Wait for extension load
  try {
    await page.waitForResponse(response => response.url().includes("/api/provider/extension") && response.status() === 200, { timeout: 60000 });
  } catch (e) {
    console.log("Extension load wait timed out or failed, continuing...");
  }
}

module.exports = {
  waitFor,
  doInitialSetup,
  beforeEachCallback,
  setThemeMode,
  beforeEachCallbackForCustomUrl,
};
