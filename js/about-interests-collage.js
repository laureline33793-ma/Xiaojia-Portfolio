(function aboutInterestsCollage() {
  const section = document.querySelector(".about-interests");
  const collage = section?.querySelector(".about-interests-collage");
  const title = section?.querySelector("#about-interests-title");
  if (!section || !collage || !title) return;

  const items = [
    collage.querySelector(".about-interests-collage__cat"),
    collage.querySelector(".about-interests-collage__uke"),
    collage.querySelector(".about-interests-collage__globe"),
  ];

  if (items.some((el) => !el)) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLLAGE_LIFT_PX = 10;

  const layouts = [
    {
      stack: { left: 29, top: 6, width: 40, rotate: -8, z: 1 },
      final: { left: -2, top: 10, width: 42, rotate: -10, z: 1 },
    },
    {
      stack: { left: 31, top: 8, width: 40, rotate: 4, z: 2 },
      final: { left: 12, top: -10, width: 54, rotate: 14, z: 3 },
    },
    {
      stack: { left: 33, top: 10, width: 40, rotate: 12, z: 3 },
      final: { left: 36, top: 16, width: 54, rotate: 0, z: 2 },
    },
  ];

  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function getTitleCenterScroll() {
    const rect = title.getBoundingClientRect();
    const centerDoc = rect.top + window.scrollY + rect.height / 2;
    return centerDoc - window.innerHeight * 0.5;
  }

  function getProgress() {
    const rangeEnd = getTitleCenterScroll();
    const rangeStart = rangeEnd - window.innerHeight * 0.42;
    const span = Math.max(rangeEnd - rangeStart, 1);
    return clamp((window.scrollY - rangeStart) / span, 0, 1);
  }

  function applyLayout(progress) {
    const opacity = progress;

    items.forEach((el, index) => {
      const { stack, final } = layouts[index];
      const pos = {
        left: lerp(stack.left, final.left, progress),
        top: lerp(stack.top, final.top, progress),
        width: lerp(stack.width, final.width, progress),
        rotate: lerp(stack.rotate, final.rotate, progress),
        z: Math.round(lerp(stack.z, final.z, progress)),
      };

      el.style.left = `${pos.left}%`;
      el.style.top = `calc(${pos.top}% - ${COLLAGE_LIFT_PX}px)`;
      el.style.width = `${pos.width}%`;
      el.style.transform = `rotate(${pos.rotate}deg)`;
      el.style.zIndex = String(pos.z);
      el.style.opacity = String(opacity);
    });

    section.classList.toggle("is-collage-expanded", progress >= 1);
  }

  function update() {
    ticking = false;
    applyLayout(getProgress());
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  if (prefersReduced) {
    applyLayout(1);
    return;
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
})();
