(function heroOpticalCenter() {
  const DESKTOP_MQ = "(min-width: 561px)";
  const WIDE_MQ = "(min-width: 1101px)";
  const MIN_EDGE_BREATH = 16;

  const hero = document.querySelector(".hero");
  const content = document.querySelector(".hero-content");
  const stack = document.querySelector(".hero-stack");
  const subtitle = document.querySelector(".hero-subtitle");
  const face = document.getElementById("spline-face");

  if (!hero || !content || !subtitle || !stack) return;

  function isDesktop() {
    return window.matchMedia(DESKTOP_MQ).matches;
  }

  function isWide() {
    return window.matchMedia(WIDE_MQ).matches;
  }

  function getViewportCapPx() {
    const headerHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-height")
    );
    const safeHeader = Number.isFinite(headerHeight) ? headerHeight : 72;
    const ratioCap = window.innerHeight * getHeightRatioCap();
    return Math.min(window.innerHeight - safeHeader, ratioCap);
  }

  function getHeightRatioCap() {
    const w = window.innerWidth;
    if (w <= 700) return 0.68;
    if (w <= 900) return 0.72;
    if (w <= 1100) return 0.78;
    return 0.84;
  }

  function canMeasureCluster() {
    if (!document.getElementById("canvas3d")) return false;
    const viewport = document.querySelector(".spline-face__viewport");
    if (!viewport) return true;
    if (viewport.classList.contains("is-mouth-reveal-done")) return true;
    const anim = getComputedStyle(viewport).animationName;
    return !anim || anim === "none";
  }

  function getClusterBottom() {
    return subtitle.getBoundingClientRect().bottom;
  }

  function clearWideInlineLayout() {
    content.style.marginTop = "";
    stack.style.removeProperty("--hero-face-spacer");
  }

  function syncNarrowOverflow() {
    const heroRect = hero.getBoundingClientRect();
    const padBottom = parseFloat(getComputedStyle(hero).paddingBottom) || 0;
    const clusterBottom = getClusterBottom();
    const viewportCap = getViewportCapPx();

    const bottomOverflow =
      clusterBottom - (heroRect.bottom - padBottom - MIN_EDGE_BREATH);

    if (bottomOverflow <= 0) {
      hero.style.minHeight = "";
      return;
    }

    const targetHeight = Math.min(
      Math.ceil(heroRect.height + bottomOverflow),
      Math.floor(viewportCap)
    );

    if (targetHeight > heroRect.height + 1) {
      hero.style.minHeight = `${targetHeight}px`;
    }
  }

  function sync() {
    if (!isDesktop()) {
      hero.style.minHeight = "";
      clearWideInlineLayout();
      return;
    }

    if (isWide()) {
      hero.style.minHeight = "";
      clearWideInlineLayout();
      return;
    }

    if (!canMeasureCluster()) return;

    clearWideInlineLayout();
    syncNarrowOverflow();
  }

  function schedule() {
    requestAnimationFrame(sync);
  }

  window.addEventListener("hero-optical-sync", schedule);

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(schedule);
    ro.observe(hero);
    ro.observe(content);
    if (face) ro.observe(face);
  }

  window.addEventListener("resize", schedule);

  window.__heroOpticalCenterSync = sync;

  sync();
})();
