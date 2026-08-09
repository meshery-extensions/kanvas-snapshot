const DESIGNER = "designer";
const VISUALIZER = "visualizer";
const extension = {
  path: "**/api/provider/extension*",
  alias: "extensionFileLoad",
};

const designEndpoint = {
  path: "**/api/pattern*",
  alias: "designEp",
  wait: "@designEp",
  absolutePath: "/api/pattern",
};

const MESHMAP_PATH = "/extension/meshmap";

const CANVAS_CONTAINER_ID = "cy-canvas-container";

const TIME = {
  SMALL: 500,
  MEDIUM: 1000,
  LARGE: 1500,
  XLARGE: 2000,
  XXLARGE: 5000,
  XXXLARGE: 10000,
  X4LARGE: 15_000,
};

const canvasContainer = {
  query: `#${CANVAS_CONTAINER_ID}`,
  alias: "canvas",
};

const cypressTestDesign = {
  url: "/extension/meshmap?design=142f0054-d9ae-4352-8618-887104a81928",
  id: "142f0054-d9ae-4352-8618-887104a81928",
};
const hierarchyRelationshipDesign = cypressTestDesign;

const cytoConversion = {
  url: "/api/pattern?output=cytoscape",
  method: "POST",
  alias: "cytoPatternConversion",
  wait: "@cytoPatternConversion",
};

/**
 * Selection and general Event Binding Layer
 */
const canvasLayer0 = {
  query: '[data-id="layer0-selectbox"]',
  alias: "layer0",
};

/**
 * drag and drop Layer
 */
const canvasLayer1 = {
  query: '[data-id="layer1-drag"]',
  alias: "layer1",
};

/**
 * Node and Element Layer
 */
const canvaslayer2 = {
  query: '[data-id="layer2-node"]',
  alias: "layer2",
};

module.exports = {
  DESIGNER,
  VISUALIZER,
  extension,
  designEndpoint,
  MESHMAP_PATH,
  CANVAS_CONTAINER_ID,
  TIME,
  canvasContainer,
  cypressTestDesign,
  hierarchyRelationshipDesign,
  cytoConversion,
  canvasLayer0,
  canvasLayer1,
  canvaslayer2,
};
