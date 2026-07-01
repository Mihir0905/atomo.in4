document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("cs-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".cs-card"));
  const filterBtns = document.querySelectorAll(".cs-filter-btn");
  const searchInput = document.querySelector(".cs-search-input");
  const searchBtn = document.querySelector(".cs-search-btn");
  const emptyEl = document.getElementById("cs-empty");

  let activeIndustry = "All";
  let searchQuery = "";

  function normalize(text) {
    return (text || "").toLowerCase().trim();
  }

  function applyFilters() {
    let visible = 0;
    const q = normalize(searchQuery);

    cards.forEach((card) => {
      const industry = card.dataset.industry || "";
      const text = normalize(card.dataset.search || "");
      const industryMatch = activeIndustry === "All" || industry === activeIndustry;
      const searchMatch = !q || text.includes(q);
      const show = industryMatch && searchMatch;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (emptyEl) {
      emptyEl.classList.toggle("is-hidden", visible > 0);
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeIndustry = btn.dataset.industry || "All";
      applyFilters();
    });
  });

  function runSearch() {
    searchQuery = searchInput ? searchInput.value : "";
    applyFilters();
  }

  if (searchBtn) searchBtn.addEventListener("click", runSearch);
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") runSearch();
    });
  }

  applyFilters();
});
