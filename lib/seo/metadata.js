const SITE_URL = process.env.SITE_URL || "https://atomo.in";

const siteConfig = {
  name: "Atomo Innovation",
  legalName: "Atomo Innovation Private Limited",
  tagline: "Building the intelligence layer for the physical world.",
  description:
    "Atomo brings real-time AI to industries, cities and critical infrastructure through an integrated edge computing platform built for speed, privacy and resilience.",
  url: SITE_URL,
  email: "hello@atomo.in",
  locale: "en_IN",
  language: "en",
  themeColor: "#071a35",
  twitterHandle: "@AtomoHQ",
  defaultKeywords: [
    "edge AI",
    "edge computing",
    "industrial IoT",
    "smart cities",
    "Atomo Innovation",
    "AtomicOS",
    "ASNN SDK",
    "Atomic Center",
    "edge AI infrastructure",
    "physical intelligence",
  ],
  addresses: [
    {
      label: "India",
      lines: [
        "W-406, 4th Floor, Siddhraj Z Square",
        "Near Landmark Mall, Kudasan",
        "Gandhinagar 382421, India",
      ],
    },
    {
      label: "AI Center of Excellence",
      lines: [
        "13th Floor, Gift Tower One",
        "GIFT City, Gandhinagar",
        "Gujarat 382355, India",
      ],
    },
  ],
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61574809191751",
    x: "https://x.com/AtomoHQ",
    instagram: "https://www.instagram.com/atomo.in/",
    linkedin: "https://www.linkedin.com/company/atomo-in",
  },
};

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX_ROBOTS = "noindex, nofollow";

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return siteConfig.url;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteConfig.url}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function createMetadata({
  title,
  description,
  path = "",
  image,
  robots,
  ogType,
  keywords,
  noindex = false,
}) {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || "/assets/brand/social-home.jpg");
  return {
    title,
    description,
    path,
    url,
    ogImage,
    ogImageAlt: title,
    robots: noindex ? NOINDEX_ROBOTS : robots || DEFAULT_ROBOTS,
    ogType: ogType || "website",
    keywords: keywords || siteConfig.defaultKeywords,
    locale: siteConfig.locale,
    language: siteConfig.language,
    twitterSite: siteConfig.twitterHandle,
    twitterCreator: siteConfig.twitterHandle,
  };
}

function organizationJsonLd() {
  const primaryAddress = siteConfig.addresses[0];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/assets/brand/atomo-logo.png"),
    },
    description: siteConfig.description,
    email: siteConfig.email,
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gandhinagar",
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
    },
    address: siteConfig.addresses.map((a) => ({
      "@type": "PostalAddress",
      streetAddress: a.lines[0],
      addressLocality: "Gandhinagar",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.email,
      availableLanguage: ["English"],
    },
    sameAs: Object.values(siteConfig.social),
  };
}

function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: "Atomo",
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

function webPageJsonLd({ name, description, url, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name,
    description,
    url,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: siteConfig.language,
    ...(path === "/" ? { primaryImageOfPage: absoluteUrl("/assets/brand/social-home.jpg") } : {}),
  };
}

function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function productJsonLd(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription,
    url: absoluteUrl(`/products/${product.slug}`),
    image: absoluteUrl(product.ogImage || product.heroImage),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    manufacturer: { "@id": `${siteConfig.url}/#organization` },
    category: "Edge AI Computing Hardware",
  };
}

function serviceJsonLd(solution) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${solution.name} Edge AI Solutions`,
    description: solution.seoDescription,
    url: absoluteUrl(`/solutions/${solution.slug}`),
    image: solution.image ? absoluteUrl(solution.image) : undefined,
    provider: { "@id": `${siteConfig.url}/#organization` },
    serviceType: "Edge AI Infrastructure",
    areaServed: "Worldwide",
  };
}

function breadcrumbsToJsonLd(breadcrumbs, currentUrl) {
  if (!breadcrumbs?.length) return null;
  return breadcrumbJsonLd(
    breadcrumbs.map((item) => ({
      name: item.label,
      url: item.href ? absoluteUrl(item.href) : currentUrl,
    })),
  );
}

function buildPageJsonLd({ title, description, url, path, breadcrumbs, extras = [] }) {
  const scripts = [webPageJsonLd({ name: title, description, url, path })];
  const breadcrumbLd = breadcrumbsToJsonLd(breadcrumbs, url);
  if (breadcrumbLd) scripts.push(breadcrumbLd);
  return [...scripts, ...extras.filter(Boolean)];
}

function getSitemapEntry(path) {
  const loc = absoluteUrl(path === "/" ? "/" : path);
  if (path === "/") {
    return { loc, changefreq: "weekly", priority: "1.0" };
  }
  if (path.startsWith("/products/") || path.startsWith("/solutions/")) {
    return { loc, changefreq: "monthly", priority: "0.9" };
  }
  if (path.startsWith("/platform")) {
    return { loc, changefreq: "monthly", priority: "0.8" };
  }
  if (path === "/contact" || path === "/company/about") {
    return { loc, changefreq: "monthly", priority: "0.8" };
  }
  if (path === "/privacy" || path === "/terms" || path === "/cookies") {
    return { loc, changefreq: "yearly", priority: "0.3" };
  }
  return { loc, changefreq: "monthly", priority: "0.7" };
}

module.exports = {
  siteConfig,
  createMetadata,
  organizationJsonLd,
  websiteJsonLd,
  webPageJsonLd,
  breadcrumbJsonLd,
  productJsonLd,
  serviceJsonLd,
  breadcrumbsToJsonLd,
  buildPageJsonLd,
  getSitemapEntry,
  absoluteUrl,
};
