/**
 * Desktop hero: hands poke the title, decor appears on contact, jelly bounce, hands retract.
 * Listens for `hero-decor-live` to mount Spline mouth when ready.
 */
(function heroPoke() {
  const DESKTOP_MQ = "(min-width: 561px)";
  const POKE_EXTRA = 38;

  const heroStack = document.querySelector(".hero-stack");
  const titleBlock = document.querySelector(".hero-title-block");
  const leftSlot = document.querySelector(".hand-slot--left");
  const rightSlot = document.querySelector(".hand-slot--right");
  const leftHand = document.querySelector(".decor-hand--left");
  const rightHand = document.querySelector(".decor-hand--right-desktop");

  if (
    !heroStack ||
    !titleBlock ||
    !leftSlot ||
    !rightSlot ||
    !leftHand ||
    !rightHand
  ) {
    return;
  }

  function isDesktop() {
    return window.matchMedia(DESKTOP_MQ).matches;
  }

  function measurePokePx() {
    const frame = titleBlock.getBoundingClientRect();
    const leftRect = leftHand.getBoundingClientRect();
    const rightRect = rightHand.getBoundingClientRect();
    const pokeLeft = frame.left - leftRect.right;
    const pokeRight = rightRect.left - frame.right;
    return Math.max(0, pokeLeft, pokeRight) + POKE_EXTRA;
  }

  function animateLength(el, prop, from, to, duration, easing) {
    return el
      .animate([{ [prop]: `${from}px` }, { [prop]: `${to}px` }], {
        duration,
        easing,
        fill: "forwards",
      })
      .finished.then(() => {
        el.style.setProperty(prop, `${to}px`);
      });
  }

  function waitEntrancePause() {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };

      leftSlot.addEventListener(
        "animationend",
        (event) => {
          if (event.animationName === "hero-hand-fade-in") finish();
        },
        { once: true }
      );

      rightSlot.addEventListener(
        "animationend",
        (event) => {
          if (event.animationName === "hero-hand-fade-in") finish();
        },
        { once: true }
      );

      setTimeout(finish, 1300);
    });
  }

  function waitFirstLayout() {
    if (window.__heroLayoutReady) return Promise.resolve();
    return new Promise((resolve) => {
      window.addEventListener("hero-layout-ready", () => resolve(), {
        once: true,
      });
      setTimeout(resolve, 1200);
    });
  }

  function revealDecor() {
    heroStack.classList.add("hero-decor--live");
    window.dispatchEvent(new CustomEvent("hero-decor-live"));
  }

  async function runPoke() {
    leftSlot.style.setProperty("--hand-poke-left", "0px");
    rightSlot.style.setProperty("--hand-poke-right", "0px");

    const amount = measurePokePx();
    const pokeIn = 360;
    const pokeOut = 540;
    const easeIn = "cubic-bezier(0.48, 0.02, 0.52, 0.98)";
    const easeOut = "cubic-bezier(0.34, 1.38, 0.64, 1)";

    await Promise.all([
      animateLength(leftSlot, "--hand-poke-left", 0, amount, pokeIn, easeIn),
      animateLength(rightSlot, "--hand-poke-right", 0, -amount, pokeIn, easeIn),
    ]);

    revealDecor();

    titleBlock.classList.add("is-jelly");
    titleBlock.addEventListener(
      "animationend",
      () => titleBlock.classList.remove("is-jelly"),
      { once: true }
    );

    await Promise.all([
      animateLength(leftSlot, "--hand-poke-left", amount, 0, pokeOut, easeOut),
      animateLength(
        rightSlot,
        "--hand-poke-right",
        -amount,
        0,
        pokeOut,
        easeOut
      ),
    ]);
  }

  async function start() {
    if (!isDesktop()) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealDecor();
      return;
    }

    await waitFirstLayout();
    await waitEntrancePause();
    await runPoke();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
