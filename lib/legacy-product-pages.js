const fs = require("fs");
const path = require("path");

const LEGACY_PRODUCTS = {
  electron: {
    folder: "electron_page",
    file: "electron.html",
    assetPrefix: "/electron_page",
  },
  proton: {
    folder: "proton_page",
    file: "proton.html",
    assetPrefix: "/proton_page",
  },
  neutron: {
    folder: "neutron_page",
    file: "neutron.html",
    assetPrefix: "/neutron_page",
  },
};

function absolutizeAssetUrls(html, assetPrefix) {
  return html
    .replace(
      /href="(?!https?:\/\/|\/\/|\/|#|mailto:|tel:|javascript:)([^"]+)"/gi,
      `href="${assetPrefix}/$1"`,
    )
    .replace(/src="(?!https?:\/\/|\/\/|\/|data:)([^"]+)"/gi, `src="${assetPrefix}/$1"`);
}

function loadLegacyProductPage(slug) {
  const config = LEGACY_PRODUCTS[slug];
  if (!config) return null;

  const filePath = path.join(__dirname, "..", config.folder, config.file);
  const html = fs.readFileSync(filePath, "utf8");
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headHtml = headMatch ? headMatch[1] : "";

  const styleBlocks = (headHtml.match(/<style[\s\S]*?<\/style>/gi) || []).join("\n");

  const linkTags = (headHtml.match(/<link[^>]+>/gi) || [])
    .filter((tag) => /rel=["']stylesheet["']/i.test(tag))
    .map((tag) => absolutizeAssetUrls(tag, config.assetPrefix))
    .join("\n");

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHtml = bodyMatch ? bodyMatch[1] : "";
  bodyHtml = absolutizeAssetUrls(bodyHtml, config.assetPrefix);

  const layoutFixes = `<style>
  html:has(body.legacy-product-layout) {
    overflow: hidden;
    height: 100%;
  }

  body.legacy-product-layout {
    overflow: hidden !important;
    height: 100vh;
    min-height: 100vh;
    display: block;
    background-color: #ffffff;
  }

  body.legacy-product-layout .legacy-product-scroll {
    position: fixed;
    top: var(--nav-height, 60px);
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
    background-color: #ffffff;
  }

  body.legacy-product-layout #main-content {
    flex: none;
    min-height: 100%;
  }

  body.legacy-product-layout .legacy-product-page #first-page {
    margin-top: 0;
    height: calc(100vh - var(--nav-height, 60px));
    min-height: calc(100vh - var(--nav-height, 60px));
  }

  body.legacy-product-layout .legacy-product-page #sixth-page {
    display: none;
  }
</style>`;

  return {
    headExtras: [linkTags, styleBlocks, layoutFixes].filter(Boolean).join("\n"),
    bodyHtml,
  };
}

function isLegacyProductSlug(slug) {
  return Object.prototype.hasOwnProperty.call(LEGACY_PRODUCTS, slug);
}

module.exports = { LEGACY_PRODUCTS, loadLegacyProductPage, isLegacyProductSlug };
