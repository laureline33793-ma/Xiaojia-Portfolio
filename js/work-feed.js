/**
 * Recent Works — filter by category; persist filter for case study Back / Next Project.
 */
(function workFeed() {
  const catalog = window.WorksCatalog;
  const TAG_TO_FILTER = catalog?.TAG_TO_FILTER || {
    "UI/UX": "ui-ux",
    Branding: "branding",
    "Motion Graphic": "motion-graphic",
    Illustration: "illustration",
    Print: "print",
    Campaign: "campaign",
    Play: "play",
  };

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "ui-ux", label: "UI/UX" },
    { id: "branding", label: "Branding" },
    { id: "motion-graphic", label: "Motion Graphic" },
    { id: "illustration", label: "Illustration" },
    { id: "print", label: "Print" },
    { id: "campaign", label: "Campaign" },
    { id: "play", label: "Play" },
  ];

  const STORAGE_KEY = "works-filter";

  const grid = document.querySelector(".works-grid");
  const filtersRoot = document.querySelector(".works-filters");
  if (!grid || !filtersRoot) return;

  const cards = [...grid.querySelectorAll(".work-card")];

  function cardMatchesFilter(card, filterId) {
    if (filterId === "all") return true;
    const tags = (card.dataset.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return tags.some((tag) => TAG_TO_FILTER[tag] === filterId);
  }

  function persistFilter(filterId) {
    if (filterId === "all") {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, filterId);
    }
    syncFilterQuery(filterId);
  }

  function syncFilterQuery(filterId) {
    try {
      if (window.location.protocol === "file:") return;
      const url = new URL(window.location.href);
      if (filterId === "all") {
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("filter", filterId);
      }
      const next = `${url.pathname}${url.search}${url.hash}`;
      history.replaceState(null, "", next);
    } catch (_) {
      /* file:// or restricted contexts */
    }
  }

  function readInitialFilter() {
    const fromUrl = new URLSearchParams(window.location.search).get("filter");
    if (fromUrl && FILTERS.some((f) => f.id === fromUrl)) return fromUrl;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && FILTERS.some((f) => f.id === stored)) return stored;
    return "all";
  }

  function setActiveFilter(filterId) {
    filtersRoot.querySelectorAll(".works-filter").forEach((btn) => {
      const active = btn.dataset.filter === filterId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    cards.forEach((card) => {
      const show = cardMatchesFilter(card, filterId);
      card.classList.toggle("is-hidden", !show);
      card.setAttribute("aria-hidden", show ? "false" : "true");
      if (show) {
        card.classList.add("is-visible", "is-reveal-done");
        card.classList.remove("is-reveal-pending");
      }
    });

    persistFilter(filterId);
  }

  FILTERS.forEach(({ id, label }, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "works-filter" + (id === "all" ? " is-active" : "");
    btn.dataset.filter = id;
    btn.style.setProperty("--filter-i", String(index));
    btn.textContent = label;
    btn.setAttribute("aria-pressed", id === "all" ? "true" : "false");
    btn.addEventListener("click", () => setActiveFilter(id));
    filtersRoot.appendChild(btn);
  });

  grid.addEventListener(
    "click",
    (event) => {
      const card = event.target.closest(".work-card");
      if (!card) return;
      const href = card.getAttribute("href");
      if (!href || href === "#") return;

      const active =
        filtersRoot.querySelector(".works-filter.is-active")?.dataset.filter || "all";
      persistFilter(active);

      if (active === "all") return;

      event.preventDefault();
      try {
        const url = new URL(href, window.location.href);
        url.searchParams.set("filter", active);
        window.location.assign(url.href);
      } catch (_) {
        const sep = href.includes("?") ? "&" : "?";
        window.location.href = `${href}${sep}filter=${encodeURIComponent(active)}`;
      }
    },
    true
  );

  setActiveFilter(readInitialFilter());
})();
