/**
 * Case study — Back link + Next Project carousel (filter-aware).
 */
(function caseNextProject() {
  const catalog = window.WorksCatalog;
  if (!catalog) return;

  const root = document.querySelector("[data-case-next]");
  if (!root) return;

  const currentId = document.body.dataset.workId || "";
  const backLink = root.querySelector(".case-back");
  const stage = root.querySelector(".case-next__stage");
  const prevBtn = root.querySelector(".case-next__arrow--prev");
  const nextBtn = root.querySelector(".case-next__arrow--next");

  if (!stage) return;

  const STORAGE_KEY = "works-filter";
  const VALID_FILTERS = new Set([
    "all",
    "ui-ux",
    "branding",
    "motion-graphic",
    "illustration",
    "print",
    "campaign",
    "play",
  ]);

  function readFilterForCasePage() {
    const fromQuery = new URLSearchParams(window.location.search).get("filter");
    if (fromQuery && VALID_FILTERS.has(fromQuery)) return fromQuery;

    const ref = document.referrer;
    if (!ref) return "all";

    try {
      const refUrl = new URL(ref);
      const fromHome =
        refUrl.origin === window.location.origin &&
        (refUrl.pathname.endsWith("/index.html") || refUrl.pathname.endsWith("/")) &&
        refUrl.hash.includes("works");
      if (fromHome) {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored && VALID_FILTERS.has(stored) ? stored : "all";
      }
    } catch (_) {
      /* ignore bad referrer */
    }

    return "all";
  }

  const filterId = readFilterForCasePage();
  const sequence = catalog.getCarouselSequence(currentId, filterId);
  let index = catalog.getNextIndex(sequence, currentId);

  function backUrl() {
    const q = filterId && filterId !== "all" ? `?filter=${encodeURIComponent(filterId)}` : "";
    return `../index.html${q}#works`;
  }

  if (backLink) {
    backLink.href = backUrl();
  }

  function renderSlide() {
    const work = sequence[index];
    if (!work) return;
    stage.innerHTML = catalog.renderWorkCard(work, {
      assetPrefix: "../",
      hrefPrefix: "../",
    });
    stage.classList.toggle("case-next__stage--wide", work.layout === "wide");

    const card = stage.querySelector(".work-card");
    if (card) card.classList.add("is-reveal-done");
    const video = stage.querySelector(".work-card__bg-video");
    if (video) {
      video.muted = true;
      const play = () => video.play().catch(() => {});
      play();
    }

    if (card) {
      const rawHref = card.getAttribute("href");
      if (!rawHref || rawHref === "#") {
        card.addEventListener("click", (e) => e.preventDefault());
      } else if (filterId !== "all") {
        const url = new URL(rawHref, window.location.href);
        url.searchParams.set("filter", filterId);
        card.setAttribute("href", `${url.pathname}${url.search}`);
      }
    }

    const solo = sequence.length <= 1;
    if (prevBtn) prevBtn.disabled = solo;
    if (nextBtn) nextBtn.disabled = solo;
  }

  function step(delta) {
    if (sequence.length <= 1) return;
    index = (index + delta + sequence.length) % sequence.length;
    renderSlide();
  }

  prevBtn?.addEventListener("click", () => step(-1));
  nextBtn?.addEventListener("click", () => step(1));

  renderSlide();
})();
