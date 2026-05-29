(function aboutHeroScroll() {
  const hero = document.querySelector(".about-hero");
  const journey = document.querySelector(".about-journey");
  const skills = document.querySelector(".about-skills");
  const interests = document.querySelector(".about-interests");
  const connect = document.querySelector(".about-connect");
  if (!hero || !journey || !skills || !interests || !connect) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitFrame = journey.querySelector(".about-visual__frame--portrait");
  const skillsStage = skills.querySelector(".about-skills__stage");
  const interestsCollage = interests.querySelector(".about-interests-collage");
  const connectTitleWrap = connect.querySelector(".about-connect__title-wrap");
  const journeyCopy = journey.querySelector(".about-journey__copy");
  const interestsTitle = interests.querySelector("#about-interests-title");
  const connectTitle = connect.querySelector("#about-connect-title");
  if (
    !portraitFrame ||
    !skillsStage ||
    !interestsCollage ||
    !connectTitleWrap ||
    !journeyCopy ||
    !interestsTitle ||
    !connectTitle
  ) {
    return;
  }

  const decoKeys = ["orange", "yellow", "star"];

  const flyingEls = decoKeys.map((key) =>
    hero.querySelector(`.about-hero__deco--${key}`)
  );
  const journeyTargets = decoKeys.map((key) =>
    journey.querySelector(`.about-journey-deco--${key}`)
  );
  const skillsTargets = decoKeys.map((key) =>
    skills.querySelector(`.about-skills-deco--${key}`)
  );
  const interestsTargets = decoKeys.map((key) =>
    interests.querySelector(`.about-interests-deco--${key}`)
  );
  const connectTargets = decoKeys.map((key) =>
    connect.querySelector(`.about-connect-deco--${key}`)
  );

  if (
    flyingEls.some((el) => !el) ||
    journeyTargets.some((el) => !el) ||
    skillsTargets.some((el) => !el) ||
    interestsTargets.some((el) => !el) ||
    connectTargets.some((el) => !el)
  ) {
    return;
  }

  let ready = false;
  let ticking = false;
  let startRects = [];
  let startWidths = [];
  let journeyOffsets = [];
  let skillsOffsets = [];
  let interestsOffsets = [];
  let connectOffsets = [];
  let connectWidths = [];
  let cachedJourneyFrameWidth = 1;
  let cachedSkillsStageWidth = 1;
  let cachedInterestsCollageWidth = 1;
  let cachedConnectTitleWidth = 1;
  let journeyScrollStart = 0;
  let journeyScrollEnd = 0;
  let skillsScrollStart = 0;
  let skillsScrollEnd = 0;
  let interestsScrollStart = 0;
  let interestsScrollEnd = 0;
  let connectScrollStart = 0;
  let connectScrollEnd = 0;
  const photo = portraitFrame.querySelector(".about-visual__photo");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function readDocRect(el) {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  function getTitleCenterScroll(titleEl) {
    const rect = titleEl.getBoundingClientRect();
    const centerDoc = rect.top + window.scrollY + rect.height / 2;
    return centerDoc - window.innerHeight * 0.5;
  }

  function cacheAnchorOffsets(anchor, targets, store, widthStore) {
    const rect = anchor.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const docLeft = rect.left + window.scrollX;

    store.length = 0;
    widthStore.length = 0;
    targets.forEach((el) => {
      const targetRect = el.getBoundingClientRect();
      store.push({
        top: targetRect.top + window.scrollY - docTop,
        left: targetRect.left + window.scrollX - docLeft,
      });
      widthStore.push(targetRect.width);
    });

    return rect.width || 1;
  }

  function getAnchorTargetDocRect(anchor, offsets, cachedWidth, index) {
    const rect = anchor.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const docLeft = rect.left + window.scrollX;
    const scale = rect.width / cachedWidth;
    const offset = offsets[index];

    return {
      top: docTop + offset.top * scale,
      left: docLeft + offset.left * scale,
    };
  }

  function getJourneyTargetDocRect(index) {
    return getAnchorTargetDocRect(
      portraitFrame,
      journeyOffsets,
      cachedJourneyFrameWidth,
      index
    );
  }

  function getSkillsTargetDocRect(index) {
    return getAnchorTargetDocRect(
      skillsStage,
      skillsOffsets,
      cachedSkillsStageWidth,
      index
    );
  }

  function getInterestsTargetDocRect(index) {
    return getAnchorTargetDocRect(
      interestsCollage,
      interestsOffsets,
      cachedInterestsCollageWidth,
      index
    );
  }

  function getConnectTargetDocRect(index) {
    return getAnchorTargetDocRect(
      connectTitleWrap,
      connectOffsets,
      cachedConnectTitleWidth,
      index
    );
  }

  function cacheScrollRanges() {
    const frameDocTop = portraitFrame.getBoundingClientRect().top + window.scrollY;
    const stageDocTop = skillsStage.getBoundingClientRect().top + window.scrollY;

    journeyScrollStart = window.innerHeight * 0.06;
    journeyScrollEnd = frameDocTop - window.innerHeight * 0.36;
    skillsScrollStart = journeyScrollEnd;
    skillsScrollEnd = stageDocTop - window.innerHeight * 0.28;
    interestsScrollStart = skillsScrollEnd;
    interestsScrollEnd = getTitleCenterScroll(interestsTitle);
    connectScrollStart = interestsScrollEnd + window.innerHeight * 0.14;
    connectScrollEnd = getTitleCenterScroll(connectTitle);
  }

  function cacheGeometry() {
    startRects = flyingEls.map(readDocRect);
    startWidths = flyingEls.map((el) => el.getBoundingClientRect().width);

    const journeyWidths = [];
    const skillsWidths = [];
    const interestsWidths = [];

    cachedJourneyFrameWidth = cacheAnchorOffsets(
      portraitFrame,
      journeyTargets,
      journeyOffsets,
      journeyWidths
    );
    cachedSkillsStageWidth = cacheAnchorOffsets(
      skillsStage,
      skillsTargets,
      skillsOffsets,
      skillsWidths
    );
    cachedInterestsCollageWidth = cacheAnchorOffsets(
      interestsCollage,
      interestsTargets,
      interestsOffsets,
      interestsWidths
    );
    cachedConnectTitleWidth = cacheAnchorOffsets(
      connectTitleWrap,
      connectTargets,
      connectOffsets,
      connectWidths
    );
    cacheScrollRanges();
  }

  function getJourneyProgress() {
    const span = Math.max(journeyScrollEnd - journeyScrollStart, 1);
    return clamp((window.scrollY - journeyScrollStart) / span, 0, 1);
  }

  function getSkillsProgress() {
    if (window.scrollY < skillsScrollStart) return 0;
    const span = Math.max(skillsScrollEnd - skillsScrollStart, 1);
    return clamp((window.scrollY - skillsScrollStart) / span, 0, 1);
  }

  function getInterestsProgress() {
    if (window.scrollY < interestsScrollStart) return 0;
    const span = Math.max(interestsScrollEnd - interestsScrollStart, 1);
    return clamp((window.scrollY - interestsScrollStart) / span, 0, 1);
  }

  function getConnectProgress() {
    if (window.scrollY < connectScrollStart) return 0;
    const span = Math.max(connectScrollEnd - connectScrollStart, 1);
    return clamp((window.scrollY - connectScrollStart) / span, 0, 1);
  }

  function clearFlyingStyles(el) {
    el.classList.remove("is-flying");
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.width = "";
    el.style.height = "";
    el.style.margin = "";
    el.style.opacity = "";
    el.style.zIndex = "";
    el.style.transform = "";
  }

  function applyFlying(el, docRect, width, behindText) {
    el.classList.add("is-flying");
    el.style.position = "fixed";
    el.style.left = `${docRect.left - window.scrollX}px`;
    el.style.top = `${docRect.top - window.scrollY}px`;
    el.style.width = `${width}px`;
    el.style.height = "auto";
    el.style.margin = "0";
    el.style.opacity = "1";
    el.style.transform = "none";

    const isStar = el.classList.contains("about-hero__deco--star");
    el.style.zIndex = behindText || !isStar ? "58" : "62";
  }

  function animateFlying(fromRects, toRects, progress, behindText, fromWidths, toWidths) {
    flyingEls.forEach((el, index) => {
      const width = toWidths
        ? lerp(fromWidths[index], toWidths[index], progress)
        : fromWidths[index];

      applyFlying(
        el,
        {
          top: lerp(fromRects[index].top, toRects[index].top, progress),
          left: lerp(fromRects[index].left, toRects[index].left, progress),
        },
        width,
        behindText
      );
    });
  }

  function setPhotoProgress(progress) {
    if (!photo) return;

    if (progress <= 0 || progress >= 1) {
      journey.classList.remove("is-scroll-active");
      photo.style.transform = "";
      return;
    }

    journey.classList.add("is-scroll-active");
    photo.style.transform = `rotateY(${lerp(-45, 0, progress)}deg)`;
  }

  function revealCopyOnce(section, visibleClass, element) {
    if (section.classList.contains(visibleClass)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          section.classList.add(visibleClass);
          observer.disconnect();
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(element);
  }

  function setJourneyRestState(active) {
    journey.classList.toggle("is-deco-settled", active);
    journey.classList.toggle("is-deco-released", !active);
  }

  function setSkillsRestState(active) {
    skills.classList.toggle("is-deco-settled", active);
    skills.classList.toggle("is-deco-released", !active);
  }

  function setInterestsRestState(active) {
    interests.classList.toggle("is-deco-settled", active);
    interests.classList.toggle("is-deco-released", !active);
  }

  function update() {
    ticking = false;
    if (!ready) return;

    cacheScrollRanges();

    const journeyProgress = getJourneyProgress();
    const skillsProgress = getSkillsProgress();
    const interestsProgress = getInterestsProgress();
    const connectProgress = getConnectProgress();
    const journeyTargetsNow = decoKeys.map((_, index) =>
      getJourneyTargetDocRect(index)
    );
    const skillsTargetsNow = decoKeys.map((_, index) =>
      getSkillsTargetDocRect(index)
    );
    const interestsTargetsNow = decoKeys.map((_, index) =>
      getInterestsTargetDocRect(index)
    );
    const connectTargetsNow = decoKeys.map((_, index) =>
      getConnectTargetDocRect(index)
    );

    hero.classList.remove("about-hero--deco-settled");
    setJourneyRestState(false);
    setSkillsRestState(false);
    setInterestsRestState(false);
    connect.classList.remove("is-deco-settled");

    if (
      journeyProgress <= 0 &&
      skillsProgress <= 0 &&
      interestsProgress <= 0 &&
      connectProgress <= 0
    ) {
      flyingEls.forEach(clearFlyingStyles);
      setPhotoProgress(0);
      return;
    }

    if (journeyProgress < 1) {
      animateFlying(
        startRects,
        journeyTargetsNow,
        journeyProgress,
        false,
        startWidths
      );
      setPhotoProgress(journeyProgress);
      return;
    }

    setPhotoProgress(1);

    if (skillsProgress < 1) {
      animateFlying(
        journeyTargetsNow,
        skillsTargetsNow,
        skillsProgress,
        true,
        startWidths
      );
      return;
    }

    if (interestsProgress < 1) {
      animateFlying(
        skillsTargetsNow,
        interestsTargetsNow,
        interestsProgress,
        true,
        startWidths
      );
      return;
    }

    if (connectProgress < 1) {
      if (connectProgress <= 0) {
        flyingEls.forEach(clearFlyingStyles);
        setInterestsRestState(true);
        return;
      }

      setInterestsRestState(false);
      animateFlying(
        interestsTargetsNow,
        connectTargetsNow,
        connectProgress,
        true,
        startWidths,
        connectWidths
      );
      return;
    }

    hero.classList.add("about-hero--deco-settled");
    setInterestsRestState(false);
    connect.classList.add("is-deco-settled");
    flyingEls.forEach(clearFlyingStyles);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  function activate() {
    if (ready) return;
    ready = true;
    cacheGeometry();
    revealCopyOnce(journey, "is-copy-visible", journeyCopy);
    revealCopyOnce(skills, "is-copy-visible", skillsStage);
    revealCopyOnce(interests, "is-copy-visible", interestsTitle);
    update();
  }

  function showReducedMotionState() {
    hero.classList.add("about-hero--deco-settled");
    journey.classList.add("is-deco-settled", "is-copy-visible");
    skills.classList.add("is-deco-settled", "is-copy-visible");
    interests.classList.add("is-deco-settled", "is-copy-visible");
    connect.classList.add("is-deco-settled");
    flyingEls.forEach(clearFlyingStyles);
    if (photo) photo.style.transform = "";
  }

  function boot() {
    if (prefersReduced) {
      showReducedMotionState();
      return;
    }

    if (hero.classList.contains("about-hero--intro-done")) {
      activate();
    } else {
      hero.addEventListener("about-hero-intro-done", activate, { once: true });
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener(
      "resize",
      () => {
        if (!ready) return;
        cacheGeometry();
        requestUpdate();
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
