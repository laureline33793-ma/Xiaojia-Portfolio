/**
 * Mobile hero only: subtle left poke, then face + flowers, jelly bounce.
 */
(function heroPokeMobile() {
  const MOBILE_MQ = "(max-width: 560px)";
  const POKE_LEFT_PX = -14;
  const POKE_IN_MS = 280;
  const POKE_OUT_MS = 420;
  const START_DELAY_MS = 700;

  const heroStack = document.querySelector(".hero-stack");
  const titleBlock = document.querySelector(".hero-title-block");
  const rightSlot = document.querySelector(".hand-slot--right");

  if (!heroStack || !titleBlock || !rightSlot) return;

  function isMobile() {
    return window.matchMedia(MOBILE_MQ).matches;
  }

  function animatePoke(from, to, duration, easing) {
    return rightSlot
      .animate(
        [
          { "--hand-poke-mobile-x": `${from}px` },
          { "--hand-poke-mobile-x": `${to}px` },
        ],
        { duration, easing, fill: "forwards" }
      )
      .finished.then(() => {
        rightSlot.style.setProperty("--hand-poke-mobile-x", `${to}px`);
      });
  }

  function revealDecor() {
    heroStack.classList.add("hero-decor--live");
    window.dispatchEvent(new CustomEvent("hero-decor-live"));
  }

  function waitLayout() {
    if (window.__heroLayoutReady) return Promise.resolve();
    return new Promise((resolve) => {
      window.addEventListener("hero-layout-ready", () => resolve(), {
        once: true,
      });
      setTimeout(resolve, 1400);
    });
  }

  async function runPoke() {
    window.__heroHandAnimating = true;

    try {
      rightSlot.style.setProperty("--hand-poke-mobile-x", "0px");

      await animatePoke(0, POKE_LEFT_PX, POKE_IN_MS, "cubic-bezier(0.48, 0.02, 0.52, 0.98)");

      revealDecor();

      titleBlock.classList.add("is-jelly");
      titleBlock.addEventListener(
        "animationend",
        () => titleBlock.classList.remove("is-jelly"),
        { once: true }
      );

      await animatePoke(
        POKE_LEFT_PX,
        0,
        POKE_OUT_MS,
        "cubic-bezier(0.34, 1.2, 0.64, 1)"
      );
    } finally {
      window.__heroHandAnimating = false;
    }
  }

  async function start() {
    if (!isMobile()) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealDecor();
      return;
    }

    await waitLayout();
    await new Promise((resolve) => setTimeout(resolve, START_DELAY_MS));
    await runPoke();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      rightSlot.style.removeProperty("--hand-poke-mobile-x");
    }
  });
})();
