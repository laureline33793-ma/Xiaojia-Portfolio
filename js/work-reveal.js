/**
 * Recent Works — per-card scroll reveal; frame then scene rises from bottom.
 * Real iOS Safari can fail clip-path + IntersectionObserver, so touch devices skip the animation.
 */
(function workReveal() {
  const feed = document.querySelector(".works-feed");
  if (!feed) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarseTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const cards = [...feed.querySelectorAll(".work-card")];
  const chrome = [...feed.querySelectorAll(
    ".works-feed__title, .works-feed__mascot, .works-filters, .works-feed__footer"
  )];

  function shouldAnimate(card) {
    return !card.classList.contains("is-hidden");
  }

  function revealEl(el) {
    el.classList.add("is-visible");
    el.classList.remove("is-reveal-pending");
  }

  function finishCardReveal(card) {
    card.classList.remove("is-reveal-pending");
    card.classList.add("is-reveal-done");
  }

  function revealCard(card) {
    if (!shouldAnimate(card)) return;
    if (card.classList.contains("is-visible")) {
      finishCardReveal(card);
      return;
    }
    card.classList.add("is-visible");
    const scene = card.querySelector(".work-card__scene");
    if (!scene) {
      finishCardReveal(card);
      return;
    }
    if (isCoarseTouch || prefersReduced) {
      finishCardReveal(card);
      return;
    }
    const onDone = (event) => {
      if (event.propertyName !== "clip-path") return;
      finishCardReveal(card);
      scene.removeEventListener("transitionend", onDone);
    };
    scene.addEventListener("transitionend", onDone);
    window.setTimeout(() => finishCardReveal(card), 2000);
  }

  function revealAll() {
    chrome.forEach(revealEl);
    cards.forEach(revealCard);
  }

  function elementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 0 && rect.top < vh * 0.96;
  }

  function revealInViewport() {
    chrome.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      if (elementInViewport(el)) revealEl(el);
    });
    cards.forEach((card) => {
      if (card.classList.contains("is-visible")) return;
      if (elementInViewport(card)) revealCard(card);
    });
  }

  function promoteMediaLoading() {
    if (!isCoarseTouch) return;
    feed.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = "eager";
    });
    feed.querySelectorAll("video[preload='metadata']").forEach((video) => {
      video.preload = "auto";
    });
  }

  if (prefersReduced || isCoarseTouch) {
    cards.forEach((card) => {
      card.classList.add("works-reveal", "is-visible", "is-reveal-done");
    });
    chrome.forEach((el) => {
      el.classList.add("works-reveal", "is-visible");
    });
    promoteMediaLoading();
  } else {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          if (card.classList.contains("is-visible")) return;
          revealCard(card);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );

    const chromeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealEl(entry.target);
          chromeObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -3% 0px" }
    );

    cards.forEach((card) => {
      card.classList.add("works-reveal", "is-reveal-pending");
      cardObserver.observe(card);
    });

    chrome.forEach((el) => {
      if (!el.classList.contains("works-reveal")) {
        el.classList.add("works-reveal", "is-reveal-pending");
      }
      chromeObserver.observe(el);
    });

    window.addEventListener("scroll", revealInViewport, { passive: true });
    window.setTimeout(revealInViewport, 120);
    window.setTimeout(revealInViewport, 800);
  }

  function scrollToWorksSection(behavior = "instant") {
    const works = document.getElementById("works");
    if (!works) return;
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    works.scrollIntoView({ block: "start", behavior });
    root.style.scrollBehavior = prev;
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#works`);
    window.setTimeout(revealInViewport, 80);
    window.setTimeout(revealInViewport, 400);
  }

  if (window.location.hash === "#works") {
    const run = () => scrollToWorksSection("instant");
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  document
    .querySelectorAll(
      '.site-nav a[href="#works"], .site-nav a[href="index.html#works"], .site-nav a[href="../index.html#works"]'
    )
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const onHome =
          /(^|\/)index\.html$/i.test(window.location.pathname) ||
          window.location.pathname.endsWith("/");
        if (!onHome) return;
        event.preventDefault();
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth";
        scrollToWorksSection(behavior);
      });
    });
})();
