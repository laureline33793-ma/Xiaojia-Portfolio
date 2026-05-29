(function aboutHeroIntro() {
  const hero = document.querySelector(".about-hero--intro");
  if (!hero) return;

  const DROP_BASE_MS = 720;
  const STAGGER_MS = [0, 180, 360];
  const FALL_MS = 480;
  const BOUNCE_MS = 280;

  const stones = [
    { selector: ".about-hero__deco--orange", centerX: true },
    { selector: ".about-hero__deco--yellow", centerX: false },
    { selector: ".about-hero__deco--star", centerX: false },
  ];

  const finish = () => {
    hero.classList.add("about-hero--intro-done");
    hero.classList.remove("about-hero--intro");
    stones.forEach((cfg) => {
      const el = hero.querySelector(cfg.selector);
      if (!el) return;
      el.style.transform = "";
      el.style.opacity = "";
      el.classList.remove("is-dropping");
    });
    hero.dispatchEvent(new CustomEvent("about-hero-intro-done"));
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.classList.add("about-hero--intro-done");
    hero.classList.remove("about-hero--intro");
    stones.forEach((cfg) => {
      const el = hero.querySelector(cfg.selector);
      if (el) el.style.opacity = "";
    });
    hero.dispatchEvent(new CustomEvent("about-hero-intro-done"));
    return;
  }

  function buildTransform(cfg, translateY, rotateDeg) {
    const base = cfg.centerX ? "translateX(-50%) " : "";
    return `${base}translateY(${translateY}px) rotate(${rotateDeg}deg)`;
  }

  function randomRotation() {
    return Math.random() * 20 - 10;
  }

  function dropDistance() {
    return Math.min(window.innerHeight * 0.22, 240);
  }

  /**
   * 自由落体位移：y = -H * (1 - t²)，关键帧之间 linear → 真实重力加速
   */
  function buildFallKeyframes(cfg, startRot, fallPx) {
    const frames = [];
    const steps = 14;

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const y = -fallPx * (1 - t * t);
      const rot = startRot * (1 - t * 0.92);
      let opacity = 0;

      if (t > 0.06) {
        opacity = Math.min(1, (t - 0.06) * 2.8);
      }

      frames.push({
        transform: buildTransform(cfg, y, rot),
        opacity,
        offset: t,
      });
    }

    return frames;
  }

  function buildBounceKeyframes(cfg, startRot) {
    return [
      {
        transform: buildTransform(cfg, 10, startRot * 0.18),
        offset: 0,
      },
      {
        transform: buildTransform(cfg, -7, startRot * 0.06),
        offset: 0.42,
      },
      {
        transform: buildTransform(cfg, 3, startRot * 0.02),
        offset: 0.72,
      },
      {
        transform: buildTransform(cfg, 0, 0),
        offset: 1,
      },
    ];
  }

  async function dropStone(cfg, staggerMs) {
    const el = hero.querySelector(cfg.selector);
    if (!el) return;

    const startRot = randomRotation();
    const fallPx = dropDistance();
    const delay = DROP_BASE_MS + staggerMs;

    el.style.opacity = "0";
    el.classList.add("is-dropping");

    const fallAnim = el.animate(buildFallKeyframes(cfg, startRot, fallPx), {
      duration: FALL_MS,
      delay,
      easing: "linear",
      fill: "forwards",
    });

    await fallAnim.finished;

    const bounceAnim = el.animate(buildBounceKeyframes(cfg, startRot), {
      duration: BOUNCE_MS,
      easing: "cubic-bezier(0.34, 1.15, 0.64, 1)",
      fill: "forwards",
    });

    await bounceAnim.finished;

    el.classList.remove("is-dropping");
    el.style.transform = "";
    el.style.opacity = "";
  }

  let finished = false;
  const finishOnce = () => {
    if (finished) return;
    finished = true;
    finish();
  };

  const startDrops = () =>
    Promise.all(
      stones.map((cfg, index) => dropStone(cfg, STAGGER_MS[index]))
    ).then(finishOnce);

  const fallbackMs = DROP_BASE_MS + STAGGER_MS[2] + FALL_MS + BOUNCE_MS + 400;
  const timer = window.setTimeout(finishOnce, fallbackMs);

  const boot = () => {
    startDrops().finally(() => window.clearTimeout(timer));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
