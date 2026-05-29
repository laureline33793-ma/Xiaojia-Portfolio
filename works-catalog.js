/**
 * Recent Works — shared catalog, filter helpers, and card markup for home + case pages.
 */
(function worksCatalog() {
  const TAG_TO_FILTER = {
    "UI/UX": "ui-ux",
    Branding: "branding",
    "Motion Graphic": "motion-graphic",
    Illustration: "illustration",
    Print: "print",
    Campaign: "campaign",
    Play: "play",
  };

  const TITLE_ARROW = `<svg class="work-card__title-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M14 8l5 4-5 4" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

  const WORKS = [
    {
      id: "trout-lake",
      href: "work/trout-lake.html",
      title: "Trout Lake Rebranding",
      tags: ["Branding", "Illustration", "UI/UX", "Print"],
      layout: "wide",
      tone: "#3d6b45",
      scene: "trout",
    },
    {
      id: "osheaga",
      href: "work/osheaga.html",
      title: "Osheaga Music Festival",
      tags: ["UI/UX", "Branding", "Illustration", "Print"],
      layout: "narrow",
      tone: "#5c2018",
      scene: "osheaga",
    },
    {
      id: "deeper-well",
      href: "work/deeper-well.html",
      title: "Deeper into the Well CD",
      tags: ["Illustration", "Print"],
      layout: "narrow",
      tone: "#bed7ef",
      scene: "cd",
    },
    {
      id: "eastside-festival",
      href: "work/eastside-festival.html",
      title: "Eastside Festival",
      tags: ["Motion Graphic", "Illustration", "Campaign"],
      layout: "narrow",
      tone: "#161514",
      scene: "video-inset",
      video: "assets/works/videos/festival.mp4",
    },
    {
      id: "winn-dixie",
      href: "work/winn-dixie.html",
      title: "Winn-Dixie Stop Motion",
      tags: ["Motion Graphic", "Play"],
      layout: "narrow",
      tone: "#c8e4a8",
      scene: "video-inset",
      video: "assets/works/videos/eastside.mp4",
    },
    {
      id: "dream-exhibition",
      href: "work/dream-exhibition.html",
      title: "Dream Exhibition Concept",
      tags: ["Illustration", "Play"],
      layout: "wide",
      tone: "#2d2448",
      scene: "video-cover",
      video: "assets/works/videos/dream.mp4",
    },
    {
      id: "truth-dare",
      href: "work/truth-dare.html",
      title: "Truth & Dare Cards for Kids",
      tags: ["Illustration", "Print"],
      layout: "narrow",
      tone: "#fad9ec",
      scene: "cards",
    },
  ];

  function workMatchesFilter(work, filterId) {
    if (!filterId || filterId === "all") return true;
    return work.tags.some((tag) => TAG_TO_FILTER[tag] === filterId);
  }

  function getFilteredWorks(filterId) {
    return WORKS.filter((work) => workMatchesFilter(work, filterId));
  }

  function resolveHref(work, basePrefix) {
    if (!work.href) return "#";
    return `${basePrefix}${work.href}`;
  }

  function renderScene(work, assetPrefix) {
    switch (work.scene) {
      case "trout":
        return `<div class="work-card__scene work-card__scene--trout">
          <img class="work-card__bg work-card__bg--trout-field" src="${assetPrefix}assets/works/trout-lake-bg.png" alt="" loading="lazy" decoding="async"/>
          <div class="work-card__trout-ui">
            <video class="work-card__bg-video work-card__bg-video--trout" src="${assetPrefix}assets/works/videos/trout-lake.mp4" loop muted playsinline webkit-playsinline preload="metadata" aria-hidden="true"></video>
          </div>
        </div>`;
      case "osheaga":
        return `<div class="work-card__scene">
          <img class="work-card__bg" src="${assetPrefix}assets/works/osheaga-bg.png" alt="" loading="lazy" decoding="async"/>
          <img class="work-card__logo" src="${assetPrefix}assets/works/osheaga-logo.png" alt="" loading="lazy" decoding="async"/>
        </div>`;
      case "cd":
        return `<div class="work-card__scene work-card__scene--art">
          <img class="work-card__art work-card__art--cd" src="${assetPrefix}assets/works/deeper-well-cd.png?v=10" alt="" loading="lazy" decoding="async"/>
        </div>`;
      case "video-inset":
        return `<div class="work-card__scene work-card__scene--video-inset">
          <video class="work-card__bg-video work-card__bg-video--inset" src="${assetPrefix}${work.video}" loop muted playsinline preload="metadata" aria-hidden="true"></video>
        </div>`;
      case "cards":
        return `<div class="work-card__scene work-card__scene--art">
          <img class="work-card__art work-card__art--cards" src="${assetPrefix}assets/works/truth-dare-cards.png?v=10" alt="" loading="lazy" decoding="async"/>
        </div>`;
      case "video-cover":
        return `<div class="work-card__scene work-card__scene--video-cover">
          <video class="work-card__bg-video work-card__bg-video--cover" src="${assetPrefix}${work.video}" loop muted playsinline preload="metadata" aria-hidden="true"></video>
        </div>`;
      default:
        return "";
    }
  }

  function renderWorkCard(work, options) {
    const base = options?.assetPrefix || "";
    const href = resolveHref(work, options?.hrefPrefix || "");
    const layoutClass = work.layout === "wide" ? " work-card--wide" : " work-card--narrow";
    const photoClass =
      work.scene === "trout" ||
      work.scene === "osheaga" ||
      work.scene === "video-inset" ||
      work.scene === "video-cover"
        ? " work-card--photo"
        : "";
    const extraClass = work.scene === "trout" ? " work-card--trout-lake" : "";
    const tagsHtml = work.tags
      .map((tag) => `<span class="work-card__tag">${tag}</span>`)
      .join("");

    return `<a href="${href}" class="work-card${layoutClass}${photoClass}${extraClass} case-next__card" data-work-id="${work.id}" data-tags="${work.tags.join(",")}" style="--work-tone: ${work.tone}">
      <div class="work-card__frame">
        ${renderScene(work, base)}
        <div class="work-card__foot">
          <div class="work-card__tags" aria-hidden="true">${tagsHtml}</div>
          <span class="work-card__title"><span class="work-card__title-text">${work.title}</span> ${TITLE_ARROW}</span>
        </div>
      </div>
    </a>`;
  }

  function getCarouselSequence(currentId, filterId) {
    const filter = filterId && filterId !== "all" ? filterId : "all";
    let sequence = getFilteredWorks(filter);
    const currentInList = sequence.some((w) => w.id === currentId);
    if (!currentInList && currentId) {
      sequence = WORKS.slice();
    }
    if (sequence.length === 0) sequence = WORKS.slice();
    return sequence;
  }

  function getNextIndex(sequence, currentId) {
    const idx = sequence.findIndex((w) => w.id === currentId);
    if (idx === -1) return 0;
    return (idx + 1) % sequence.length;
  }

  window.WorksCatalog = {
    WORKS,
    TAG_TO_FILTER,
    workMatchesFilter,
    getFilteredWorks,
    getCarouselSequence,
    getNextIndex,
    renderWorkCard,
    resolveHref,
  };
})();
