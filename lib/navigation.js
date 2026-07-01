const primaryNav = [
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Electron", href: "/products/electron" },
      { label: "Proton", href: "/products/proton" },
      { label: "Neutron", href: "/products/neutron" },
      { label: "Compare Products", href: "/products/compare" },
    ],
  },
  {
    label: "Platform",
    href: "/platform",
    children: [
      { label: "AtomicOS", href: "/platform/atomicos", description: "Edge-native operating environment" },
      { label: "ASNN SDK", href: "/platform/asnn-sdk", description: "Deploy and optimize AI workloads" },
      { label: "Atomic Center", href: "/platform/atomic-center", description: "Fleet deployment and management" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Manufacturing", href: "/solutions/manufacturing" },
      { label: "Smart Cities", href: "/solutions/smart-cities" },
      { label: "Construction", href: "/solutions/construction" },
      { label: "Critical Infrastructure", href: "/solutions/critical-infrastructure" },
      { label: "Transportation", href: "/solutions/transportation" },
      { label: "Utilities", href: "/solutions/utilities" },
      { label: "Defence & Aerospace", href: "/solutions/defence-aerospace" },
    ],
  },
  {
    label: "Developers",
    href: "/developers",
    children: [
      { label: "Developer Overview", href: "/developers" },
      { label: "Documentation", href: "/developers/documentation" },
      { label: "AI Engineer Program", href: "/developers/ai-engineer-program" },
      { label: "Remote Access Program", href: "/developers/remote-access" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "About Atomo", href: "/company/about" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Careers", href: "/company/careers" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "Blogs", href: "/resources/blogs" },
      { label: "Press Kit", href: "/press-kit" },
    ],
  },
];

const footerColumns = [
  { title: "Platform", links: primaryNav[1].children },
  { title: "Solutions", links: primaryNav[2].children },
  { title: "Products", links: primaryNav[0].children },
  { title: "Developers", links: primaryNav[3].children },
  { title: "Company", links: primaryNav[4].children },
  { title: "Resources", links: primaryNav[5].children },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookie Settings", href: "/cookies" },
    ],
  },
];

const redirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/electron_page/electron.html", destination: "/products/electron", permanent: true },
  { source: "/electron.html", destination: "/products/electron", permanent: true },
  { source: "/proton_page/proton.html", destination: "/products/proton", permanent: true },
  { source: "/proton.html", destination: "/products/proton", permanent: true },
  { source: "/neutron_page/neutron.html", destination: "/products/neutron", permanent: true },
  { source: "/neutron.html", destination: "/products/neutron", permanent: true },
  { source: "/atomicos_page/atomicos.html", destination: "/platform/atomicos", permanent: true },
  { source: "/atomicos.html", destination: "/platform/atomicos", permanent: true },
  { source: "/atomo-int_page/int.html", destination: "/platform/asnn-sdk", permanent: true },
  { source: "/airowl_page/airowl.html", destination: "/contact", permanent: true },
  { source: "/about_page/about.html", destination: "/company/about", permanent: true },
  { source: "/about.html", destination: "/company/about", permanent: true },
  { source: "/presskit_page/press.html", destination: "/press-kit", permanent: true },
  { source: "/press.html", destination: "/press-kit", permanent: true },
  { source: "/carrier_page/carrier.html", destination: "/company/careers", permanent: true },
  { source: "/carrier.html", destination: "/company/careers", permanent: true },
  { source: "/support_page/support.html", destination: "/contact", permanent: true },
  { source: "/blogs/blogs.html", destination: "/resources/blogs", permanent: true },
  { source: "/blogs/blog-detail.html", destination: "/resources/blogs/detail", permanent: true },
  { source: "/case_studies_page/case-studies.html", destination: "/resources/case-studies", permanent: true },
  { source: "/resources/insights", destination: "/resources/blogs", permanent: true },
  { source: "/resources/videos", destination: "/resources", permanent: true },
  { source: "/news/index.html", destination: "/newsroom", permanent: true },
  { source: "/news", destination: "/newsroom", permanent: true },
];

module.exports = { primaryNav, footerColumns, redirects };
