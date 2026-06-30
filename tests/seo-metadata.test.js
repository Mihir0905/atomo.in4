import { describe, it, expect } from "vitest";
import {
  createMetadata,
  organizationJsonLd,
  websiteJsonLd,
  productJsonLd,
  serviceJsonLd,
  buildPageJsonLd,
  getSitemapEntry,
  absoluteUrl,
  siteConfig,
} from "../lib/seo/metadata.js";

describe("createMetadata", () => {
  it("builds canonical URLs and default robots", () => {
    const meta = createMetadata({
      title: "Test Page | Atomo",
      description: "Test description",
      path: "/platform",
    });
    expect(meta.url).toBe(`${siteConfig.url}/platform`);
    expect(meta.robots).toContain("index");
    expect(meta.ogType).toBe("website");
    expect(meta.keywords).toEqual(siteConfig.defaultKeywords);
  });

  it("marks noindex pages correctly", () => {
    const meta = createMetadata({
      title: "Not Found",
      description: "Missing",
      path: "/missing",
      noindex: true,
    });
    expect(meta.robots).toBe("noindex, nofollow");
  });

  it("resolves absolute and relative images", () => {
    const relative = createMetadata({
      title: "Product",
      description: "Desc",
      path: "/products/electron",
      image: "/assets/test.jpg",
    });
    expect(relative.ogImage).toBe(`${siteConfig.url}/assets/test.jpg`);

    const absolute = createMetadata({
      title: "Product",
      description: "Desc",
      path: "/products/electron",
      image: "https://cdn.example.com/image.jpg",
    });
    expect(absolute.ogImage).toBe("https://cdn.example.com/image.jpg");
  });
});

describe("JSON-LD helpers", () => {
  it("includes organization identifiers", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe(`${siteConfig.url}/#organization`);
    expect(org.sameAs.length).toBeGreaterThan(0);
  });

  it("links website schema to organization", () => {
    const site = websiteJsonLd();
    expect(site.publisher["@id"]).toBe(`${siteConfig.url}/#organization`);
  });

  it("builds product and service schemas", () => {
    const product = productJsonLd({
      slug: "electron",
      name: "Electron",
      seoDescription: "Industrial edge AI computer",
      heroImage: "/assets/products/electron/electron-hero.png",
    });
    expect(product["@type"]).toBe("Product");
    expect(product.url).toBe(`${siteConfig.url}/products/electron`);

    const solution = serviceJsonLd({
      slug: "manufacturing",
      name: "Manufacturing",
      seoDescription: "Manufacturing edge AI",
      image: "/assets/industries/manufacturing.png",
    });
    expect(solution["@type"]).toBe("Service");
    expect(solution.url).toBe(`${siteConfig.url}/solutions/manufacturing`);
  });

  it("assembles page-level structured data", () => {
    const scripts = buildPageJsonLd({
      title: "About",
      description: "About Atomo",
      url: `${siteConfig.url}/company/about`,
      path: "/company/about",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Company", href: "/company" },
        { label: "About" },
      ],
    });
    expect(scripts).toHaveLength(2);
    expect(scripts[0]["@type"]).toBe("WebPage");
    expect(scripts[1]["@type"]).toBe("BreadcrumbList");
  });
});

describe("getSitemapEntry", () => {
  it("prioritizes key landing pages", () => {
    expect(getSitemapEntry("/").priority).toBe("1.0");
    expect(getSitemapEntry("/products/electron").priority).toBe("0.9");
    expect(getSitemapEntry("/privacy").priority).toBe("0.3");
  });
});

describe("absoluteUrl", () => {
  it("normalizes paths", () => {
    expect(absoluteUrl("/contact")).toBe(`${siteConfig.url}/contact`);
    expect(absoluteUrl("contact")).toBe(`${siteConfig.url}/contact`);
  });
});
