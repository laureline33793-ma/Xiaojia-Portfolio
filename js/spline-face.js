import { Application } from "https://cdn.jsdelivr.net/npm/@splinetool/runtime@1.12.95/build/runtime.js";

const SCENE_URL =
  "https://prod.spline.design/Zcw3imYSYIgyR-3S/scene.splinecode?v=6";
const DESKTOP_MQ = "(min-width: 561px)";
const BASE_WIDTH_RATIO = 0.44;
const BASE_HEIGHT_RATIO = 1.02;
const DISPLAY_SCALE = 3.2;
const SCENE_ZOOM = 0.8;
const MOBILE_SCENE_ZOOM = 0.58;
const MOUTH_BOTTOM_FRAC = 0.66;
const MOBILE_DISPLAY_WIDTH_RATIO = 0.72;
const MOBILE_DISPLAY_HEIGHT_EM = 1.72;
const MOBILE_SIZE_BOOST = 1.22;
const MOBILE_RENDER_BUFFER = 2.35;
/* viewport 底边对齐 shell 底，下唇贴 I 底边 */
const MOBILE_MOUTH_OFFSET_Y = -18;
const MOBILE_MOUTH_CENTER_X = 0.5;
const MOBILE_MOUTH_NUDGE_X = -20;
const MOBILE_MOUTH_NUDGE_Y = 0;

const container = document.getElementById("spline-face");
if (!container) {
  /* not on home hero */
} else {
  /** Uniform scale from .hero-content transform (ignore translate). */
  function getHeroContentScale() {
    const content = document.querySelector(".hero-content");
    if (!content) return 1;
    const transform = getComputedStyle(content).transform;
    if (!transform || transform === "none") return 1;
    const matrix = new DOMMatrix(transform);
    const scale = matrix.a;
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  function getLayoutLineWidth(titleLine) {
    return titleLine.offsetWidth || titleLine.getBoundingClientRect().width;
  }

  function getLayoutOffsetTop(child, ancestor) {
    let top = 0;
    let node = child;
    while (node && node !== ancestor) {
      top += node.offsetTop;
      node = node.offsetParent;
      if (!node || !ancestor.contains(node)) break;
    }
    return top;
  }

  let mounted = false;
  let app = null;
  let shell = null;
  let frame = null;
  let viewport = null;
  let canvas = null;
  let placeholder = null;
  let mobileLayout = null;

  function getMobileLayoutSizes(lineRect, fontSize) {
    const displayW = Math.max(
      150,
      Math.round(
        lineRect.width * MOBILE_DISPLAY_WIDTH_RATIO * MOBILE_SIZE_BOOST
      )
    );
    const displayH = Math.max(
      100,
      Math.round(fontSize * MOBILE_DISPLAY_HEIGHT_EM * MOBILE_SIZE_BOOST)
    );
    const renderW = Math.round(displayW * MOBILE_RENDER_BUFFER);
    const renderH = Math.round(displayH * MOBILE_RENDER_BUFFER);

    return {
      displayW,
      displayH,
      renderW,
      renderH,
      visualScale: displayW / renderW,
    };
  }

  function getDisplaySize() {
    const titleLine = document.querySelector(".hero-title__line");
    const title = document.querySelector(".hero-title");
    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;

    if (titleLine && title) {
      const lineWidth = getLayoutLineWidth(titleLine);
      const fontSize = parseFloat(getComputedStyle(title).fontSize);

      if (!isDesktop) {
        const mobile = getMobileLayoutSizes(
          { width: lineWidth },
          fontSize
        );
        return {
          width: mobile.displayW,
          height: mobile.displayH,
          mobile,
        };
      }

      const scale = DISPLAY_SCALE;
      return {
        width: Math.max(
          160,
          Math.round(lineWidth * BASE_WIDTH_RATIO * scale)
        ),
        height: Math.max(
          120,
          Math.round(fontSize * BASE_HEIGHT_RATIO * scale)
        ),
      };
    }

    return { width: isDesktop ? 580 : 300, height: isDesktop ? 390 : 200 };
  }

  function applyBoxSize(el, size) {
    if (!el) return;
    el.style.width = `${size.width}px`;
    el.style.height = `${size.height}px`;
    el.style.maxWidth = "none";
    el.style.maxHeight = "none";
  }

  function clearContainerBox() {
    container.style.width = "";
    container.style.height = "";
    container.style.maxWidth = "";
    container.style.maxHeight = "";
  }

  function forceTransparentBackground() {
    const targets = [shell, frame, viewport, canvas, container];
    targets.forEach((el) => {
      if (!el) return;
      el.style.background = "transparent";
      el.style.backgroundColor = "transparent";
      el.style.boxShadow = "none";
      el.style.border = "none";
    });

    if (canvas) {
      canvas.style.display = "block";
      canvas.style.verticalAlign = "top";
    }

    if (app) {
      app.setBackgroundColor("transparent");
    }
  }

  function hidePlaceholder() {
    if (!placeholder) return;
    placeholder.style.display = "none";
    placeholder.style.visibility = "hidden";
    placeholder.style.opacity = "0";
  }

  function applyMobileContainerPosition(left, top) {
    const leftPx = `${Math.round(left)}px`;
    const topPx = `${Math.round(top)}px`;
    container.style.setProperty("--spline-mouth-left", leftPx);
    container.style.setProperty("--spline-mouth-top", topPx);
    container.style.left = leftPx;
    container.style.top = topPx;
    container.style.right = "auto";
    container.style.transform = "none";
    container.classList.add("spline-face--mobile");

    if (shell) {
      shell.style.transform = `translate(${MOBILE_MOUTH_NUDGE_X}px, ${MOBILE_MOUTH_NUDGE_Y}px)`;
    }
  }

  function syncSplinePosition() {
    const titleLine = document.querySelector(".hero-title__line");
    const stack = document.querySelector(".hero-stack");
    if (!stack || !shell) return;

    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;
    const contentScale = getHeroContentScale();

    if (!isDesktop) {
      const alignI = document.querySelector(".hero-title__letter--align-i");
      const anchor = alignI || titleLine;
      if (!anchor) return;

      const faceW =
        mobileLayout?.displayW || shell.offsetWidth || getDisplaySize().width;
      const faceH =
        mobileLayout?.displayH || shell.offsetHeight || getDisplaySize().height;
      const anchorRect = anchor.getBoundingClientRect();
      const stackRect = stack.getBoundingClientRect();
      const mouthCenterX =
        (anchorRect.left - stackRect.left) / contentScale +
        (anchor.offsetWidth * MOBILE_MOUTH_CENTER_X);
      /* 下唇 ≈ shell 底边，shell 底对齐 I 底边 */
      const anchorBottom =
        getLayoutOffsetTop(anchor, stack) + anchor.offsetHeight;
      const top = anchorBottom - faceH + MOBILE_MOUTH_OFFSET_Y;
      const left = mouthCenterX - faceW / 2;

      applyMobileContainerPosition(left, top);
      return;
    }

    container.classList.remove("spline-face--mobile");
    const faceH = shell.offsetHeight || getDisplaySize().height;
    const faceW = shell.offsetWidth || getDisplaySize().width;

    const alignI = document.querySelector(".hero-title__letter--align-i");
    if (!alignI) return;

    const mouthOffsetX = -20;
    const mouthOffsetY = 60;
    const iTop = getLayoutOffsetTop(alignI, stack);
    const top = iTop - faceH * MOUTH_BOTTOM_FRAC + mouthOffsetY;

    container.style.left = "50%";
    container.style.top = `${Math.round(top)}px`;
    container.style.transform = `translateX(calc(-50% + ${mouthOffsetX}px))`;
  }

  function syncCanvasLayout() {
    if (!shell || !frame || !viewport || !canvas) return;

    const size = getDisplaySize();
    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;

    clearContainerBox();
    shell.style.overflow = "visible";
    frame.style.overflow = "visible";
    viewport.style.overflow = "visible";

    if (!isDesktop && size.mobile) {
      mobileLayout = size.mobile;
      const { displayW, displayH, renderW, renderH, visualScale } = size.mobile;

      applyBoxSize(shell, { width: displayW, height: displayH });
      applyBoxSize(frame, { width: displayW, height: displayH });
      applyBoxSize(viewport, { width: renderW, height: renderH });
      applyBoxSize(canvas, { width: renderW, height: renderH });

      frame.style.position = "relative";
      viewport.style.position = "absolute";
      viewport.style.left = "50%";
      viewport.style.bottom = "0";
      viewport.style.top = "auto";
      viewport.style.margin = "0";
      viewport.style.transform = `translateX(-50%) scale(${visualScale})`;
      viewport.style.transformOrigin = "center bottom";

      if (app) {
        app.setSize(renderW, renderH);
        app.setZoom(MOBILE_SCENE_ZOOM);
        forceTransparentBackground();
      }
    } else {
      mobileLayout = null;
      applyBoxSize(shell, size);
      applyBoxSize(frame, size);
      applyBoxSize(viewport, size);
      applyBoxSize(canvas, size);
      frame.style.position = "";
      viewport.style.position = "";
      viewport.style.left = "";
      viewport.style.bottom = "";
      viewport.style.top = "";
      viewport.style.margin = "";
      viewport.style.transform = "";
      viewport.style.transformOrigin = "";
      if (shell) shell.style.transform = "";

      if (app) {
        app.setSize(size.width, size.height);
        app.setZoom(SCENE_ZOOM);
        forceTransparentBackground();
      }
    }

    syncSplinePosition();
  }

  function scheduleLayoutSync() {
    requestAnimationFrame(() => {
      syncCanvasLayout();
      requestAnimationFrame(() => {
        syncSplinePosition();
        if (
          window.matchMedia(DESKTOP_MQ).matches &&
          viewport?.classList.contains("is-mouth-reveal-done")
        ) {
          window.__heroOpticalCenterSync?.();
        }
        window.dispatchEvent(new CustomEvent("hero-optical-sync"));
      });
    });
  }

  function blockScrollOnCanvas() {
    const stopScroll = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    canvas.addEventListener("wheel", stopScroll, { passive: false });
    canvas.addEventListener("touchmove", stopScroll, { passive: false });
  }

  async function mountSplineFace() {
    if (mounted) return;
    mounted = true;

    placeholder = container.querySelector(".spline-face__placeholder");

    shell = document.createElement("div");
    shell.className = "spline-face__shell";

    frame = document.createElement("div");
    frame.className = "spline-face__frame";

    viewport = document.createElement("div");
    viewport.className = "spline-face__viewport";

    canvas = document.createElement("canvas");
    canvas.id = "canvas3d";
    canvas.className = "spline-face__canvas";

    viewport.appendChild(canvas);
    frame.appendChild(viewport);
    shell.appendChild(frame);
    container.insertBefore(shell, placeholder);

    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;
    const revealEl = isDesktop ? viewport : shell;

    revealEl.addEventListener(
      "animationend",
      (event) => {
        if (
          event.animationName !== "hero-mouth-pop-up" &&
          event.animationName !== "hero-mouth-pop-up-mobile"
        ) {
          return;
        }
        revealEl.classList.add("is-mouth-reveal-done");
        window.__heroOpticalCenterSync?.();
      },
      { once: true }
    );

    hidePlaceholder();
    syncCanvasLayout();
    blockScrollOnCanvas();

    try {
      app = new Application(canvas, { premultipliedAlpha: false });
      forceTransparentBackground();
      await app.load(SCENE_URL);
      app.setGlobalEvents(true);
      forceTransparentBackground();
      scheduleLayoutSync();

      if (!window.matchMedia(DESKTOP_MQ).matches) {
        window.dispatchEvent(
          new CustomEvent("hero-spline-ready", { detail: { app } })
        );
        scheduleLayoutSync();
      }

      window.addEventListener("resize", scheduleLayoutSync);
      window.addEventListener("hero-layout-ready", scheduleLayoutSync);
      window.addEventListener("hero-decor-live", scheduleLayoutSync);

      if (document.fonts?.ready) {
        document.fonts.ready.then(scheduleLayoutSync);
      }

      if ("ResizeObserver" in window) {
        const alignI = document.querySelector(".hero-title__letter--align-i");
        const titleLine = document.querySelector(".hero-title__line");
        const heroContent = document.querySelector(".hero-content");
        const ro = new ResizeObserver(scheduleLayoutSync);
        if (alignI) ro.observe(alignI);
        if (titleLine) ro.observe(titleLine);
        if (heroContent) ro.observe(heroContent);
      }
    } catch (error) {
      console.error("Spline face failed to load:", error);
      shell?.remove();
      shell = null;
      frame = null;
      viewport = null;
      canvas = null;
      app = null;
      mounted = false;
    }
  }

  function runMount() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => mountSplineFace());
    });
  }

  function scheduleMount() {
    const heroStack = document.querySelector(".hero-stack");
    const isDesktop = window.matchMedia(DESKTOP_MQ).matches;

    if (!isDesktop || heroStack?.classList.contains("hero-decor--live")) {
      runMount();
      return;
    }

    window.addEventListener(
      "hero-decor-live",
      () => setTimeout(runMount, 80),
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleMount);
  } else {
    scheduleMount();
  }
}
