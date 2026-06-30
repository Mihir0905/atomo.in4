const express = require("express");
const {
  createMetadata,
  siteConfig,
  organizationJsonLd,
  websiteJsonLd,
  buildPageJsonLd,
  productJsonLd,
  serviceJsonLd,
  getSitemapEntry,
} = require("../lib/seo/metadata");
const { getAllRoutes } = require("../lib/seo/routes");
const { getProduct, productList } = require("../content/products/index.js");
const { getSolution, solutions } = require("../content/solutions/index.js");
const { getApprovedValue, getApprovedValues } = require("../lib/content/verification");
const { staticPages } = require("../lib/pages-data");
const { loadLegacyProductPage, isLegacyProductSlug } = require("../lib/legacy-product-pages");

const router = express.Router();

function renderPage(res, view, { path, meta, ...locals }) {
  res.render(view, { ...locals, path, meta, site: siteConfig }, (err, body) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("layout", {
      body,
      meta,
      path,
      site: siteConfig,
      year: new Date().getFullYear(),
      orgJsonLd: organizationJsonLd(),
      websiteJsonLd: locals.websiteJsonLd,
      jsonLd: locals.jsonLd,
      loadContactJs: locals.loadContactJs,
      loadHomeAssets: locals.loadHomeAssets,
      productHeadExtras: locals.productHeadExtras,
      legacyProductLayout: locals.legacyProductLayout,
    });
  });
}

router.get("/", (req, res) => {
  const meta = createMetadata({
    title: "Atomo | Edge AI Infrastructure for the Physical World",
    description: siteConfig.description,
    path: "/",
    ogType: "website",
  });
  renderPage(res, "home/home.html", {
    path: "/",
    meta,
    solutions,
    productList,
    loadHomeAssets: true,
    websiteJsonLd: websiteJsonLd(),
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/",
    }),
  });
});

router.get("/sitemap.xml", (req, res) => {
  const now = new Date().toISOString().split("T")[0];
  const urls = getAllRoutes()
    .map((p) => {
      const entry = getSitemapEntry(p);
      return `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
    })
    .join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
  );
});

router.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${siteConfig.url}/sitemap.xml\nHost: ${siteConfig.url}\n`,
  );
});

router.get("/llms.txt", (req, res) => {
  const routes = getAllRoutes();
  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.description}

## Contact

- Email: ${siteConfig.email}
- Website: ${siteConfig.url}

## Key pages

${routes.map((p) => `- ${siteConfig.url}${p === "/" ? "" : p}`).join("\n")}

## About

${siteConfig.legalName} builds integrated edge AI infrastructure — from purpose-built hardware to
AtomicOS, ASNN SDK and Atomic Center fleet management.
`;
  res.type("text/plain").send(body);
});

router.get("/rss.xml", (req, res) => {
  const pubDate = new Date().toUTCString();
  const items = getAllRoutes()
    .map(
      (p) => `    <item>
      <title>${p === "/" ? "Home" : p}</title>
      <link>${siteConfig.url}${p === "/" ? "" : p}</link>
      <guid isPermaLink="true">${siteConfig.url}${p === "/" ? "" : p}</guid>
      <description>Atomo Innovation — ${siteConfig.tagline}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`,
    )
    .join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n<title>${siteConfig.name}</title>\n<link>${siteConfig.url}</link>\n<description>${siteConfig.description}</description>\n<language>en-in</language>\n<lastBuildDate>${pubDate}</lastBuildDate>\n<atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />\n${items}\n</channel>\n</rss>`,
  );
});

router.get("/manifest.webmanifest", (req, res) => {
  res.json({
    name: siteConfig.name,
    short_name: "Atomo",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "en-IN",
    dir: "ltr",
    background_color: siteConfig.themeColor,
    theme_color: "#00e5ff",
    categories: ["business", "productivity", "technology"],
    icons: [
      { src: "/assets/brand/atomo-logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/assets/brand/atomo-logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  });
});

router.get("/products/compare", (req, res) => {
  const specLabels = [];
  for (const product of productList) {
    for (const spec of product.specs) {
      if (getApprovedValue(spec.value)) specLabels.push(spec.label);
    }
  }
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Compare" },
  ];
  const meta = createMetadata({
    title: "Compare Atomo Processing Units | Electron, Proton & Neutron",
    description:
      "Compare Electron, Proton and Neutron specifications side by side. Only verified specifications are shown.",
    path: "/products/compare",
  });
  renderPage(res, "pages/compare", {
    path: "/products/compare",
    meta,
    specLabels: [...new Set(specLabels)],
    productList,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/products/compare",
      breadcrumbs,
    }),
  });
});

router.get("/products/:slug", (req, res) => {
  const product = getProduct(req.params.slug);
  if (!product) {
    return res.status(404).render("404", {
      meta: createMetadata({
        title: "Page Not Found | Atomo",
        description: "The page you requested could not be found.",
        path: req.path,
        noindex: true,
      }),
      path: req.path,
    });
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: product.name },
  ];
  const meta = createMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/products/${product.slug}`,
    image: product.ogImage || product.heroImage,
    ogType: "product",
  });
  const jsonLd = buildPageJsonLd({
    title: meta.title,
    description: meta.description,
    url: meta.url,
    path: meta.path,
    breadcrumbs,
    extras: [productJsonLd(product)],
  });

  if (isLegacyProductSlug(req.params.slug)) {
    const legacy = loadLegacyProductPage(req.params.slug);
    return renderPage(res, "products/legacy", {
      path: `/products/${product.slug}`,
      meta,
      productHeadExtras: legacy.headExtras,
      bodyHtml: legacy.bodyHtml,
      legacyProductLayout: true,
      jsonLd,
    });
  }

  renderPage(res, "pages/product", {
    path: `/products/${product.slug}`,
    meta,
    product,
    breadcrumbs,
    jsonLd,
  });
});

router.get("/solutions/:slug", (req, res) => {
  const solution = getSolution(req.params.slug);
  if (!solution) {
    return res.status(404).render("404", {
      meta: createMetadata({
        title: "Page Not Found | Atomo",
        description: "The page you requested could not be found.",
        path: req.path,
        noindex: true,
      }),
      path: req.path,
    });
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions" },
    { label: solution.name },
  ];
  const meta = createMetadata({
    title: solution.seoTitle,
    description: solution.seoDescription,
    path: `/solutions/${solution.slug}`,
    image: solution.image,
  });
  renderPage(res, "pages/solution", {
    path: `/solutions/${solution.slug}`,
    meta,
    solution,
    breadcrumbs,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: meta.path,
      breadcrumbs,
      extras: [serviceJsonLd(solution)],
    }),
  });
});

router.get("/contact", (req, res) => {
  const valid = ["general", "enterprise", "product", "partnership", "developer", "media", "career", "support"];
  const interest = valid.includes(req.query.interest) ? req.query.interest : "general";
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Contact" }];
  const meta = createMetadata({
    title: "Contact Atomo | Edge AI Infrastructure",
    description:
      "Contact Atomo Innovation for deployment inquiries, developer programs, partnerships, media and careers.",
    path: "/contact",
  });
  renderPage(res, "pages/contact", {
    path: "/contact",
    meta,
    interest,
    breadcrumbs,
    loadContactJs: true,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/contact",
      breadcrumbs,
    }),
  });
});

router.get("/company/about", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Company", href: "/company" },
    { label: "About" },
  ];
  const meta = createMetadata({
    title: "About Atomo | Edge AI Infrastructure Company",
    description:
      "Atomo Innovation builds integrated edge AI infrastructure — headquartered in Gandhinagar, India.",
    path: "/company/about",
  });
  renderPage(res, "company/about.html", {
    path: "/company/about",
    meta,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/company/about",
      breadcrumbs,
    }),
  });
});

// Static pages from manifest
for (const page of staticPages) {
  router.get(page.path, (req, res) => {
    const { recognitionItems } = require("../content/recognition/index.js");
    const meta = createMetadata({ title: page.title, description: page.description, path: page.path });
    renderPage(res, page.view || "pages/standard", {
      path: page.path,
      meta,
      page,
      solutions,
      productList,
      recognitionItems,
      jsonLd: buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: page.path,
        breadcrumbs: page.hero?.breadcrumbs,
      }),
    });
  });
}

module.exports = router;
