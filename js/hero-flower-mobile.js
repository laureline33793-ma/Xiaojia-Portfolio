/**
 * Mobile hero: ambient flower pops + long-press spray (no hover).
 */
(function heroFlowerMobile() {
  const MOBILE_MQ = "(max-width: 560px)";
  const LONG_PRESS_MS = 380;
  const SPAWN_MS = 85;
  const MAX_PARTICLES = 40;
  const GRAVITY = 260;
  const LIFE_MS = [2200, 3200];
  const AMBIENT_MIN_MS = 2200;
  const AMBIENT_MAX_MS = 4400;

  const heroStack = document.querySelector(".hero-stack");
  if (!heroStack) return;

  const particlesRoot = document.createElement("div");
  particlesRoot.className = "flower-particles";
  particlesRoot.setAttribute("aria-hidden", "true");
  heroStack.appendChild(particlesRoot);

  let activeParticles = 0;
  const sprayTimers = new WeakMap();
  let ambientTimer = null;
  let bound = false;

  function canRun() {
    return (
      window.matchMedia(MOBILE_MQ).matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      heroStack.classList.contains("hero-decor--live")
    );
  }

  function spawnParticle(flower, count = 1, options = {}) {
    if (!canRun()) return;

    const pokeFall = options.pokeFall === true;

    for (let i = 0; i < count; i += 1) {
      if (activeParticles >= MAX_PARTICLES) return;

      const stackRect = heroStack.getBoundingClientRect();
      const rect = flower.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - stackRect.left;
      const cy = rect.top + rect.height / 2 - stackRect.top;
      const size = rect.width * (pokeFall ? 0.22 + Math.random() * 0.14 : 0.2 + Math.random() * 0.18);

      const img = document.createElement("img");
      img.className = "flower-particle";
      img.src = flower.src;
      img.alt = "";
      img.style.width = `${size}px`;
      img.style.left = `${cx}px`;
      img.style.top = `${cy}px`;

      let velX;
      let velY;
      let spinSpeed;

      if (pokeFall) {
        velX = (Math.random() - 0.5) * 56;
        velY = 18 + Math.random() * 36;
        spinSpeed = (Math.random() - 0.5) * 90;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const burstSpeed = 60 + Math.random() * 72;
        velX = Math.cos(angle) * burstSpeed;
        velY =
          Math.sin(angle) * burstSpeed * 0.45 - (44 + Math.random() * 40);
        spinSpeed = (Math.random() - 0.5) * 120;
      }

      const spinStart = Math.random() * 360;
      const lifeMs = LIFE_MS[0] + Math.random() * (LIFE_MS[1] - LIFE_MS[0]);
      const fadeStart = 0.58;

      particlesRoot.appendChild(img);
      activeParticles += 1;

      const start = performance.now();

      function tick(now) {
        const elapsed = (now - start) / 1000;
        const progress = elapsed / (lifeMs / 1000);

        if (progress >= 1) {
          img.remove();
          activeParticles -= 1;
          return;
        }

        const x = velX * elapsed;
        const y = velY * elapsed + 0.5 * GRAVITY * elapsed * elapsed;
        const rot = spinStart + spinSpeed * elapsed;
        const scale =
          progress < 0.12
            ? 0.32 + (progress / 0.12) * 0.68
            : 1 - Math.max(0, (progress - 0.75) / 0.25) * 0.18;
        const opacity =
          progress < fadeStart
            ? 0.88 + progress * 0.12
            : 1 - (progress - fadeStart) / (1 - fadeStart);

        img.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
        img.style.opacity = String(Math.max(0, opacity));

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }
  }

  function startSpray(flower) {
    if (!canRun()) return;

    spawnParticle(flower);
    const timerId = window.setInterval(() => spawnParticle(flower), SPAWN_MS);
    sprayTimers.set(flower, timerId);
  }

  function stopSpray(flower) {
    const timerId = sprayTimers.get(flower);
    if (timerId == null) return;
    window.clearInterval(timerId);
    sprayTimers.delete(flower);
  }

  function spawnPokeBurst() {
    if (!canRun()) return;

    const flowers = [...heroStack.querySelectorAll(".title-flower")];
    if (!flowers.length) return;

    const dropCount = Math.random() < 0.45 ? 2 : 3;
    const picked = flowers.sort(() => Math.random() - 0.5).slice(0, dropCount);

    picked.forEach((flower, index) => {
      window.setTimeout(
        () => spawnParticle(flower, 1, { pokeFall: true }),
        index * 130
      );
    });
  }

  function scheduleAmbient() {
    if (!canRun()) return;

    const flowers = [...heroStack.querySelectorAll(".title-flower")];
    if (!flowers.length) return;

    const flower = flowers[Math.floor(Math.random() * flowers.length)];
    const count = Math.random() < 0.55 ? 2 : 1;
    spawnParticle(flower, count);

    const wait =
      AMBIENT_MIN_MS + Math.random() * (AMBIENT_MAX_MS - AMBIENT_MIN_MS);
    ambientTimer = window.setTimeout(scheduleAmbient, wait);
  }

  function bindFlowers() {
    if (bound) return;
    bound = true;

    heroStack.querySelectorAll(".title-flower").forEach((flower) => {
      let pressTimer = null;
      let spraying = false;

      flower.addEventListener(
        "touchstart",
        () => {
          pressTimer = window.setTimeout(() => {
            spraying = true;
            startSpray(flower);
          }, LONG_PRESS_MS);
        },
        { passive: true }
      );

      const endPress = () => {
        if (pressTimer != null) {
          window.clearTimeout(pressTimer);
          pressTimer = null;
        }
        if (spraying) {
          spraying = false;
          stopSpray(flower);
        }
      };

      flower.addEventListener("touchend", endPress, { passive: true });
      flower.addEventListener("touchcancel", endPress, { passive: true });
    });
  }

  function init() {
    if (!window.matchMedia(MOBILE_MQ).matches) return;

    bindFlowers();
    window.setTimeout(spawnPokeBurst, 320);
    if (ambientTimer != null) window.clearTimeout(ambientTimer);
    scheduleAmbient();
  }

  function stop() {
    if (ambientTimer != null) {
      window.clearTimeout(ambientTimer);
      ambientTimer = null;
    }
    heroStack.querySelectorAll(".title-flower").forEach(stopSpray);
  }

  window.addEventListener("hero-decor-live", init, { once: true });

  window.addEventListener("resize", () => {
    if (!window.matchMedia(MOBILE_MQ).matches) stop();
  });
})();
