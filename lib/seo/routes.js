const fs = require("fs");
const path = require("path");
const { productList } = require("../../content/products/index.js");
const { solutions } = require("../../content/solutions/index.js");

const CASE_STUDIES_DIR = path.join(__dirname, "..", "..", "case_studies_page");

function getCaseStudyRoutes() {
  if (!fs.existsSync(CASE_STUDIES_DIR)) return [];
  return fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((file) => file.endsWith(".html") && file !== "case-studies.html")
    .map((file) => `/resources/case-studies/${file.replace(/\.html$/, "")}`);
}

const staticRoutes = [
  "/",
  "/platform",
  "/platform/atomicos",
  "/platform/asnn-sdk",
  "/platform/atomic-center",
  "/platform/edge-hardware",
  "/platform/security",
  "/solutions",
  "/products",
  "/products/compare",
  "/developers",
  "/developers/documentation",
  "/developers/ai-engineer-program",
  "/developers/remote-access",
  "/support",
  "/company",
  "/company/about",
  "/company/founder-vision",
  "/company/leadership",
  "/company/advisors",
  "/company/governance",
  "/company/recognition",
  "/company/careers",
  "/resources",
  "/resources/case-studies",
  "/resources/blogs",
  "/resources/blogs/detail",
  "/newsroom",
  "/press-kit",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

function getAllRoutes() {
  return [
    ...staticRoutes,
    ...solutions.map((s) => `/solutions/${s.slug}`),
    ...productList.map((p) => `/products/${p.slug}`),
    ...getCaseStudyRoutes(),
  ];
}

module.exports = { staticRoutes, getAllRoutes };
