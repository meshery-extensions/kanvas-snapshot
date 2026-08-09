const { test: base } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

exports.test = base.extend({
  // Custom fixture for login
  login: async ({ page }, use) => {
    await use(async () => {
      const token = process.env.CYPRESS_token || ""; // Fallback or load from env
      await page.context().addCookies([
        {
          name: "meshery-provider",
          value: "Layer5",
          domain: "playground.meshery.io",
          path: "/",
        },
        {
          name: "token",
          value: token,
          domain: "playground.meshery.io",
          path: "/",
        },
      ]);
    });
  },

  // Custom fixture for setting release tag
  setReleaseTag: async ({ page }, use) => {
    await use(async (version) => {
      // Mock the capabilities response
      // We'll read the original fixture if available, or just mock a minimal structure
      // For now, let's assume we can just intercept the request
      await page.route("**/api/provider/capabilities", async (route) => {
        const capabilities = {
          package_version: version || process.env.CYPRESS_releasetag || "latest",
          package_url: `https://github.com/layer5labs/meshery-extensions-packages/releases/download/${
            version || process.env.CYPRESS_releasetag || "latest"
          }/provider-meshery.tar.gz`,
        };
        await route.fulfill({ json: capabilities });
      });
    });
  },

  // Custom fixture for setting mode
  setMode: async ({ page }, use) => {
    await use(async (mode) => {
      await page.addInitScript((m) => {
        try {
          window.localStorage.setItem("mode", m);
        } catch (e) {
          // Ignore access denied errors (e.g. on about:blank)
        }
      }, mode);
    });
  },

  // Custom fixture for setting theme mode
  setThemeMode: async ({ page }, use) => {
    await use(async (mode) => {
      await page.addInitScript((m) => {
        try {
          window.localStorage.setItem("Theme", m);
        } catch (e) {
          // Ignore access denied errors
        }
      }, mode);
    });
  },

  // Custom fixture for intercepting capabilities (if not using setReleaseTag)
  interceptCapabilities: async ({ page }, use) => {
    await use(async () => {
      // This might be redundant if setReleaseTag handles the intercept
      // But we'll keep it for compatibility
      // We can point to a local file if needed, but fulfilling with JSON is easier
       await page.route("**/api/provider/capabilities", async (route) => {
         // You might want to load this from a file if it's complex
         const capabilities = {
            // ... default capabilities
         };
         await route.fulfill({ json: capabilities });
       });
    });
  },

  // Custom fixture for DPI and Resize
  dpiAndResize: async ({ page }, use) => {
    await use(async (scaleFactor, width, height) => {
      await page.setViewportSize({ width, height });
      const client = await page.context().newCDPSession(page);
      await client.send("Emulation.setDeviceMetricsOverride", {
        deviceScaleFactor: scaleFactor,
        width: 0,
        height: 0,
        mobile: false,
      });
    });
  },
});
