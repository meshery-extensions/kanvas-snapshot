# Playwright Tests for Kanvas Snapshot

This directory contains Playwright tests converted from Cypress for the Kanvas Snapshot automation.

## Environment Requirements

The tests require the following environment variables to be set:

| Variable | Description | Example |
|----------|-------------|---------|
| `CYPRESS_token` | Meshery/Layer5 Cloud API token for authentication | Your API token from Layer5 Cloud |
| `CYPRESS_applicationId` | Design UUID to render | `3c116d0a-49ea-4294-addc-d9ab34210662` |
| `CYPRESS_releasetag` | (Optional) Release tag for capabilities | `v0.7.0` |

## Endpoint Configuration

- **Base URL**: `https://playground.meshery.io` (configured in `playwright.config.js`)
- **Design Rendering**: `/extension/meshmap?mode=design&design={designId}&render=full`

## Authentication

The tests authenticate by setting cookies:
- `meshery-provider`: Set to `Layer5`
- `token`: Set to the value from `CYPRESS_token` environment variable

## Running Tests

### With Environment Variables

```bash
export CYPRESS_token="your-token-here"
export CYPRESS_applicationId="your-design-id-here"
npx playwright test tests/loadDesign.spec.js
```

### In CI/CD (GitHub Actions)

Environment variables are automatically set from workflow inputs:
- `CYPRESS_token: ${{ inputs.mesheryToken }}`
- `CYPRESS_applicationId: ${{ env.APPLICATION_ID }}`

## Test Output

Screenshots are saved to the `cypress/screenshots/` directory (maintaining compatibility with the original Cypress structure):
- `snapshot-light.png`
- `snapshot-dark.png`
