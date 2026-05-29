/**
 * Desktop hero: hover a flower to pause its spin and spray mini copies that fall.
 */
(function heroFlowerHover() {
  const DESKTOP_MQ = "(min-width: 561px)";
  const SPAWN_MS = 85;
  const MAX_PARTICLES = 48;
  const GRAVITY = 260;
  const LIFE_MS = [2400, 3400];

  const heroStack = document.querySelector(".hero-stack");
  if (!heroStack) return;

  const particlesRoot = document.createElement("div");
  particlesRoot.className = "flower-particles";
  particlesRoot.setAttribute("aria-hidden", "true");
  heroStack.appendChild(particlesRoot);

  let activeParticles = 0;
  const spawnTimers = new WeakMap();

  function canRun() {
    return (
      window.matchMedia(DESKTOP_MQ).matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      heroStack.classList.contains("hero-decor--live")
    );
  }

  function spawnParticle(flower) {
    if (!canRun() || activeParticles >= MAX_PARTICLES) return;

    const stackRect = heroStack.getBoundingClientRect();
    const rect = flower.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - stackRect.left;
    const cy = rect.top + rect.height / 2 - stackRect.top;
    const size = rect.width * (0.14 + Math.random() * 0.16);

    const img = document.createElement("img");
    img.className = "flower-particle";
    img.src = flower.src;
    img.alt = "";
    img.style.width = `${size}px`;
    img.style.left = `${cx}px`;
    img.style.top = `${cy}px`;

    const angle = Math.random() * Math.PI * 2;
    const burstSpeed = 72 + Math.random() * 88;
    const velX = Math.cos(angle) * burstSpeed;
    const velY =
      Math.sin(angle) * burstSpeed * 0.45 - (52 + Math.random() * 48);
    const spinStart = Math.random() * 360;
    const spinSpeed = (Math.random() - 0.5) * 140;
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

  function startSpray(flower) {
    if (!canRun()) return;

    spawnParticle(flower);
    const timerId = window.setInterval(() => spawnParticle(flower), SPAWN_MS);
    spawnTimers.set(flower, timerId);
  }

  function stopSpray(flower) {
    const timerId = spawnTimers.get(flower);
    if (timerId == null) return;
    window.clearInterval(timerId);
    spawnTimers.delete(flower);
  }

  function bindFlowers() {
    heroStack.querySelectorAll(".title-flower").forEach((flower) => {
      flower.addEventListener("mouseenter", () => startSpray(flower));
      flower.addEventListener("mouseleave", () => stopSpray(flower));
    });
  }

  function init() {
    if (!window.matchMedia(DESKTOP_MQ).matches) return;
    bindFlowers();
  }

  window.addEventListener("hero-decor-live", init, { once: true });

  if (heroStack.classList.contains("hero-decor--live")) {
    init();
  }
})();
