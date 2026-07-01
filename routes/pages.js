const express = require("express");
const fs = require("fs");
const path = require("path");
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

const CASE_STUDIES_DIR = path.join(__dirname, "..", "case_studies_page");

function caseStudyHtmlPath(slug) {
  return path.join(CASE_STUDIES_DIR, `${slug}.html`);
}

function parseCaseStudyHtmlMeta(slug) {
  const html = fs.readFileSync(caseStudyHtmlPath(slug), "utf8");
  const titleMatch = html.match(/class="cs-detail-title">([^<]+)</);
  const summaryMatch = html.match(/<h2>Overview<\/h2><p>([^<]+)</);
  const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  return {
    title: titleMatch ? decode(titleMatch[1]) : "Case Study",
    summary: summaryMatch
      ? decode(summaryMatch[1])
      : "Edge AI deployment case study from Atomo Innovation.",
  };
}

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
      loadCareersAssets: locals.loadCareersAssets,
      loadAtomicosAssets: locals.loadAtomicosAssets,
      loadPressKitAssets: locals.loadPressKitAssets,
      loadBlogsAssets: locals.loadBlogsAssets,
      loadBlogDetailAssets: locals.loadBlogDetailAssets,
      loadCaseStudiesAssets: locals.loadCaseStudiesAssets,
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

const jobPostingJsonLd = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Multiple Roles - IoT Development, AI Engineering, Smart Device Manufacturing",
  description:
    "Join Atomo Innovation Pvt. Ltd. and work on cutting-edge IoT, AI, and automation technologies. Explore roles in hardware, software, and research.",
  datePosted: "2025-08-27",
  employmentType: "FULL_TIME",
  hiringOrganization: {
    "@type": "Organization",
    name: "Atomo Innovation Pvt. Ltd.",
    sameAs: "https://atomo.in/",
    logo: "https://atomo.in/assets/atomoheaderlogo.png",
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      streetAddress: "W-406 4th Floor, Siddhraj Z Square Near Landmark Mall Kudasan",
      addressLocality: "Gandhinagar",
      addressRegion: "Gujarat",
      postalCode: "382421",
      addressCountry: "IN",
    },
  },
  applicantLocationRequirements: {
    "@type": "Country",
    name: "India",
  },
};

router.get("/company/careers", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Company", href: "/company" },
    { label: "Careers" },
  ];
  const meta = createMetadata({
    title: "Careers at Atomo | Join Our Innovation Team",
    description:
      "Join Atomo Innovation - Career opportunities in IoT development, AI engineering, and smart device manufacturing. Grow with our innovative team.",
    path: "/company/careers",
  });
  renderPage(res, "company/careers.html", {
    path: "/company/careers",
    meta,
    loadCareersAssets: true,
    jsonLd: [
      ...buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: "/company/careers",
        breadcrumbs,
      }),
      jobPostingJsonLd,
    ],
  });
});

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AtomicOS",
  operatingSystem: "Linux-based IoT OS",
  applicationCategory: "Operating System",
  description:
    "AtomicOS is a high-performance Linux OS built for AI, IoT, and edge computing. Designed for speed, security, and intelligence—right from the silicon to the cloud.",
  image: "https://atomo.in/atomicos/assets/social-atomicos.jpg",
  softwareVersion: "1.0",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/PreOrder",
  },
  publisher: {
    "@type": "Organization",
    name: "Atomo Innovation",
    url: "https://atomo.in",
  },
  url: "https://atomo.in/platform/atomicos",
};

router.get("/platform/atomicos", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Platform", href: "/platform" },
    { label: "AtomicOS" },
  ];
  const meta = createMetadata({
    title: "AtomicOS | IoT Operating System & Smart Device Platform",
    description:
      "AtomicOS - IoT operating system optimized for Atomo devices, delivering smooth performance and seamless connectivity.",
    path: "/platform/atomicos",
  });
  renderPage(res, "platform/atomicos.html", {
    path: "/platform/atomicos",
    meta,
    loadAtomicosAssets: true,
    jsonLd: [
      ...buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: "/platform/atomicos",
        breadcrumbs,
      }),
      softwareApplicationJsonLd,
    ],
  });
});

const pressKitWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Atomo Press Kit | Media Resources & Company Information",
  url: "https://atomo.in/press-kit",
  description:
    "Media resources, company information, and press releases for journalists and content creators.",
  publisher: {
    "@type": "Organization",
    name: "Atomo Innovation Pvt. Ltd.",
    logo: {
      "@type": "ImageObject",
      url: "https://atomo.in/assets/atomoheaderlogo.png",
    },
  },
  mainEntity: [
    { "@type": "MediaObject", name: "About Atomo", url: "https://atomo.in/presskit_page/press_icons/icon.svg" },
    { "@type": "MediaObject", name: "Atomo Logo", url: "https://atomo.in/presskit_page/press_icons/icon2.svg" },
    { "@type": "MediaObject", name: "Founder's Profile", url: "https://atomo.in/presskit_page/press_icons/icon3.svg" },
    { "@type": "MediaObject", name: "Founder's Pictures", url: "https://atomo.in/presskit_page/press_icons/icon4.svg" },
    { "@type": "MediaObject", name: "Atomo Team Pictures", url: "https://atomo.in/presskit_page/press_icons/icon5.svg" },
    { "@type": "MediaObject", name: "Atomo Brand Guidelines", url: "https://atomo.in/presskit_page/press_icons/icon6.svg" },
    { "@type": "MediaObject", name: "Product Photos", url: "https://atomo.in/presskit_page/press_icons/icon7.svg" },
    { "@type": "MediaObject", name: "Company Profile", url: "https://atomo.in/presskit_page/press_icons/icon8.svg" },
    { "@type": "MediaObject", name: "Atomo Product Card", url: "https://atomo.in/presskit_page/press_icons/icon9.svg" },
  ],
};

router.get("/resources/case-studies", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Case Studies" },
  ];
  const meta = createMetadata({
    title: "Case Studies | Atomo Innovation",
    description:
      "Real-world edge AI deployment case studies — manufacturing, smart cities, construction, critical infrastructure and more.",
    path: "/resources/case-studies",
  });
  renderPage(res, "case-studies.html", {
    path: "/resources/case-studies",
    meta,
    loadCaseStudiesAssets: true,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/resources/case-studies",
      breadcrumbs,
    }),
  });
});

router.get("/resources/case-studies/:slug", (req, res) => {
  const { slug } = req.params;
  const htmlPath = caseStudyHtmlPath(slug);
  if (!fs.existsSync(htmlPath)) {
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
  const { title, summary } = parseCaseStudyHtmlMeta(slug);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Case Studies", href: "/resources/case-studies" },
    { label: title },
  ];
  const pagePath = `/resources/case-studies/${slug}`;
  const meta = createMetadata({
    title: `${title} | Case Study | Atomo`,
    description: summary,
    path: pagePath,
    image: "/assets/videos/home-cover/atomo-home-cover-poster.webp",
  });
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: summary,
    author: { "@type": "Organization", name: siteConfig.legalName },
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/assets/brand/atomo-logo.png` },
    },
    mainEntityOfPage: meta.url,
  };
  renderPage(res, `${slug}.html`, {
    path: pagePath,
    meta,
    loadCaseStudiesAssets: true,
    jsonLd: [
      ...buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: pagePath,
        breadcrumbs,
      }),
      articleJsonLd,
    ],
  });
});

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Atomo Innovation Blogs",
  url: "https://atomo.in/resources/blogs",
  description:
    "Read the latest insights, innovations, and updates from Atomo Innovation. Explore our blog for smart living solutions and IoT advancements.",
  publisher: {
    "@type": "Organization",
    name: "Atomo Innovation PVT. LTD.",
    url: "https://atomo.in",
    logo: "https://atomo.in/assets/atomoheaderlogo.png",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61574809191751",
      "https://x.com/AtomoHQ",
      "https://www.instagram.com/atomo.in/",
      "https://www.linkedin.com/company/atomo-in",
    ],
  },
};

router.get("/resources/blogs", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Blogs" },
  ];
  const meta = createMetadata({
    title: "Blogs | Atomo Innovation",
    description:
      "Read the latest insights, innovations, and updates from Atomo Innovation. Explore our blog for smart living solutions and IoT advancements.",
    path: "/resources/blogs",
  });
  renderPage(res, "resources/blogs.html", {
    path: "/resources/blogs",
    meta,
    loadBlogsAssets: true,
    jsonLd: [
      ...buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: "/resources/blogs",
        breadcrumbs,
      }),
      blogJsonLd,
    ],
  });
});

router.get("/resources/blogs/detail", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Blogs", href: "/resources/blogs" },
    { label: "Article" },
  ];
  const meta = createMetadata({
    title: "Blog Detail | Atomo Innovation",
    description: "Detailed blog post from Atomo Innovation covering smart living and IoT topics.",
    path: "/resources/blogs/detail",
  });
  renderPage(res, "resources/blog-detail.html", {
    path: "/resources/blogs/detail",
    meta,
    loadBlogDetailAssets: true,
    jsonLd: buildPageJsonLd({
      title: meta.title,
      description: meta.description,
      url: meta.url,
      path: "/resources/blogs/detail",
      breadcrumbs,
    }),
  });
});

router.get("/press-kit", (req, res) => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Press Kit" },
  ];
  const meta = createMetadata({
    title: "Atomo Press Kit | Media Resources & Company Information",
    description:
      "Atomo Press Kit - Media resources, company information, product images, and press releases for journalists and content creators.",
    path: "/press-kit",
  });
  renderPage(res, "resources/press-kit.html", {
    path: "/press-kit",
    meta,
    loadPressKitAssets: true,
    jsonLd: [
      ...buildPageJsonLd({
        title: meta.title,
        description: meta.description,
        url: meta.url,
        path: "/press-kit",
        breadcrumbs,
      }),
      pressKitWebPageJsonLd,
    ],
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
