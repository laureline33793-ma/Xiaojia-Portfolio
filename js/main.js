(function aimHeroHands() {
  const FINGER_Y = 0.28;
  /* 竖版右手 PNG 左侧有大片透明区 */
  const FINGER_X_RIGHT_DESKTOP = 0.32;
  /* 竖版左手 PNG 右侧有大片透明区 */
  const FINGER_X_LEFT = 0.7;
  /* 横版手机素材：手指在左侧 */
  const FINGER_X_RIGHT_MOBILE = 0.12;
  const FINGER_Y_MOBILE = 0.24;
  const MOBILE_NAME_Y = 0.45;
  const MOBILE_BASE_SHIFT_X = 36;
  const MOBILE_HAND_NUDGE_X = -60;
  const MOBILE_HAND_SCALE_BOOST = 1.14;
  const MOBILE_BASE_SCALE = 1.18;
  const MOBILE_LIFT_Y = -56;
  const MOBILE_GAP_EXTRA = 8;
  const MOBILE_MAX_SHIFT_X = () => Math.min(340, window.innerWidth * 0.88);
  const CLEARANCE = 20;
  /* 桌面端指尖与标题强制留白（px），绝不触碰 */
  const DESKTOP_GAP_SAFE = 3;
  /* 长手臂素材：指尖约 0.22，对准标题两行之间 */
  const DESKTOP_AIM_TITLE_Y = 0.36;
  const DESKTOP_AIM_HAND_Y = 0.22;
  const DESKTOP_AIM_DOWN = 56;
  const maxPushOut = () => {
    const w = window.innerWidth;
    if (w <= 560) return Math.min(240, w * 0.58);
    if (w <= 900) return Math.min(260, w * 0.38);
    if (w <= 1100) return Math.min(180, w * 0.22);
    return w * 0.85;
  };

  function readDesktopGapPx() {
    return readHandTextGapPx() + DESKTOP_GAP_SAFE;
  }

  function desktopTextLimits() {
    const frame = titleBlock.getBoundingClientRect();
    const gap = readDesktopGapPx();
    return {
      maxLeftEdgeX: frame.left - gap,
      minRightEdgeX: frame.right + gap,
    };
  }

  function measureDesktopEdgeDeltaPx() {
    const limits = desktopTextLimits();
    const leftRect = leftHand.getBoundingClientRect();
    const rightRect = rightHandDesktop.getBoundingClientRect();

    return {
      overlapL: leftRect.right - limits.maxLeftEdgeX,
      overlapR: limits.minRightEdgeX - rightRect.left,
    };
  }

  const root = document.documentElement;
  const titleEl = document.querySelector(".hero-title");
  const titleBlock = document.querySelector(".hero-title-block");
  const subtitle = document.querySelector(".hero-subtitle");
  const leftHand = document.querySelector(".decor-hand--left");
  const rightHandDesktop = document.querySelector(".decor-hand--right-desktop");
  const rightHandMobile = document.querySelector(".decor-hand--right-mobile");
  const titleNameEl = document.querySelector(".hero-title__name");
  if (
    !titleEl ||
    !titleBlock ||
    !subtitle ||
    !leftHand ||
    !rightHandDesktop ||
    !rightHandMobile
  ) {
    return;
  }

  let gapProbe;

  function fingerLineY(rect) {
    return rect.top + rect.height * FINGER_Y;
  }

  function readHandTextGapPx() {
    if (!gapProbe) {
      gapProbe = document.createElement("div");
      gapProbe.setAttribute("aria-hidden", "true");
      gapProbe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none;width:var(--hand-text-gap);";
      document.body.appendChild(gapProbe);
    }
    return gapProbe.getBoundingClientRect().width;
  }

  function updateLift() {
    if (isMobileHands()) {
      root.style.setProperty("--hand-lift", "0px");
      return;
    }

    const subRect = subtitle.getBoundingClientRect();
    const leftRect = leftHand.getBoundingClientRect();
    const rightRect = rightHandDesktop.getBoundingClientRect();
    const fingerY = Math.max(fingerLineY(leftRect), fingerLineY(rightRect));
    const targetY = subRect.top - CLEARANCE;
    const lift = Math.min(0, targetY - fingerY);

    root.style.setProperty("--hand-lift", `${lift}px`);
  }

  function isMobileHands() {
    return window.matchMedia("(max-width: 560px)").matches;
  }

  function leftFingerX(rect) {
    return rect.left + rect.width * FINGER_X_LEFT;
  }

  function rightFingerX(rect, mobile) {
    const ratio = mobile ? FINGER_X_RIGHT_MOBILE : FINGER_X_RIGHT_DESKTOP;
    return rect.left + rect.width * ratio;
  }

  function mobileFingerTargetX() {
    const gap = readHandTextGapPx();
    const titleRect = titleEl.getBoundingClientRect();
    return titleRect.right + gap + MOBILE_GAP_EXTRA + MOBILE_HAND_NUDGE_X;
  }

  function measureMobileAdjustPx() {
    const rightRect = rightHandMobile.getBoundingClientRect();
    return rightFingerX(rightRect, true) - mobileFingerTargetX();
  }

  function mobileMinShiftX() {
    return Math.max(0, MOBILE_BASE_SHIFT_X + MOBILE_HAND_NUDGE_X);
  }

  function updateDesktopShiftY() {
    if (isMobileHands()) {
      root.style.setProperty("--hand-desktop-shift-y", "0px");
      return;
    }

    root.style.setProperty("--hand-desktop-shift-y", "0px");
    void leftHand.offsetWidth;

    const titleRect = titleEl.getBoundingClientRect();
    const targetY = titleRect.top + titleRect.height * DESKTOP_AIM_TITLE_Y;
    const leftRect = leftHand.getBoundingClientRect();
    const rightRect = rightHandDesktop.getBoundingClientRect();
    const leftAimY = leftRect.top + leftRect.height * DESKTOP_AIM_HAND_Y;
    const rightAimY = rightRect.top + rightRect.height * DESKTOP_AIM_HAND_Y;
    const shiftY =
      Math.round(targetY - (leftAimY + rightAimY) / 2) + DESKTOP_AIM_DOWN;

    root.style.setProperty("--hand-desktop-shift-y", `${shiftY}px`);
  }

  function updateDesktopAnchors() {
    if (isMobileHands()) return;

    const handsEl = document.querySelector(".hero-hands");
    if (!handsEl) return;

    root.style.setProperty("--hand-push-out", "0px");

    const handsRect = handsEl.getBoundingClientRect();
    const limits = desktopTextLimits();

    let leftAnchor = titleBlock.getBoundingClientRect().left - handsRect.left;
    let rightAnchor =
      handsRect.right - titleBlock.getBoundingClientRect().right;

    const placeAnchors = () => {
      root.style.setProperty("--hand-anchor-left", `${Math.round(leftAnchor)}px`);
      root.style.setProperty(
        "--hand-anchor-right",
        `${Math.round(rightAnchor)}px`
      );
    };

    placeAnchors();

    for (let i = 0; i < 12; i += 1) {
      void rightHandDesktop.offsetWidth;
      const leftRect = leftHand.getBoundingClientRect();
      const rightRect = rightHandDesktop.getBoundingClientRect();
      const deltaL = leftRect.right - limits.maxLeftEdgeX;
      const deltaR = limits.minRightEdgeX - rightRect.left;

      if (Math.abs(deltaL) <= 0.5 && Math.abs(deltaR) <= 0.5) break;

      leftAnchor -= deltaL;
      rightAnchor -= deltaR;
      placeAnchors();
    }
  }

  function measurePushOutPx() {
    const { overlapL, overlapR } = measureDesktopEdgeDeltaPx();
    return Math.min(maxPushOut(), Math.max(0, overlapL, overlapR));
  }

  function mobileAimY() {
    const aimRect = titleNameEl
      ? titleNameEl.getBoundingClientRect()
      : titleEl.getBoundingClientRect();
    return aimRect.top + aimRect.height * MOBILE_NAME_Y;
  }

  function readCssPx(name, fallback) {
    const raw = getComputedStyle(root).getPropertyValue(name).trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  function updateMobileShiftY() {
    const targetY = mobileAimY();
    const currentShift = readCssPx("--hand-mobile-shift-y", 0);
    const handRect = rightHandMobile.getBoundingClientRect();
    const fingerY = handRect.top + handRect.height * FINGER_Y_MOBILE;
    const fingerYAtZero = fingerY - currentShift;
    const shiftY = Math.round(targetY - fingerYAtZero) + MOBILE_LIFT_Y;
    root.style.setProperty("--hand-mobile-shift-y", `${shiftY}px`);
    return shiftY;
  }

  function setMobileShiftX(shiftX) {
    root.style.setProperty("--hand-mobile-shift-x", `${Math.round(shiftX)}px`);
  }

  function updateMobileScale() {
    const defaultScale = MOBILE_BASE_SCALE * MOBILE_HAND_SCALE_BOOST;
    let scale = readCssPx("--hand-mobile-scale", defaultScale);
    let shiftX = readCssPx("--hand-mobile-shift-x", MOBILE_BASE_SHIFT_X);

    if (scale <= 1.01) scale = defaultScale;
    if (shiftX < mobileMinShiftX()) shiftX = MOBILE_BASE_SHIFT_X;

    root.style.setProperty("--hand-mobile-scale", scale.toFixed(3));
    setMobileShiftX(shiftX);
    updateMobileShiftY();
    void rightHandMobile.offsetWidth;

    for (let i = 0; i < 16; i += 1) {
      root.style.setProperty("--hand-mobile-scale", String(scale));
      setMobileShiftX(shiftX);
      updateMobileShiftY();
      void rightHandMobile.offsetWidth;

      const delta = measureMobileAdjustPx();
      if (Math.abs(delta) <= 1) break;

      const width = rightHandMobile.getBoundingClientRect().width || 1;

      if (delta < 0) {
        shiftX += Math.min(22, -delta * 0.95);
      } else if (shiftX > mobileMinShiftX()) {
        shiftX -= Math.min(22, delta * 0.95);
        shiftX = Math.max(mobileMinShiftX(), shiftX);
      } else {
        scale += (delta / width) * 1.2;
      }

      scale = Math.max(MOBILE_BASE_SCALE * MOBILE_HAND_SCALE_BOOST, Math.min(2.1, scale));
      shiftX = Math.max(mobileMinShiftX(), Math.min(MOBILE_MAX_SHIFT_X(), shiftX));
    }

    root.style.setProperty("--hand-mobile-scale", scale.toFixed(3));
      setMobileShiftX(shiftX);
      updateMobileShiftY();

    let finalDelta = measureMobileAdjustPx();
    while (finalDelta < -1 && shiftX < MOBILE_MAX_SHIFT_X()) {
      shiftX = Math.min(
        MOBILE_MAX_SHIFT_X(),
        shiftX + Math.min(24, -finalDelta * 0.95)
      );
      setMobileShiftX(shiftX);
      updateMobileShiftY();
      void rightHandMobile.offsetWidth;
      finalDelta = measureMobileAdjustPx();
    }
    while (finalDelta > 1 && shiftX > mobileMinShiftX()) {
      shiftX = Math.max(
        mobileMinShiftX(),
        shiftX - Math.min(24, finalDelta * 0.95)
      );
      setMobileShiftX(shiftX);
      updateMobileShiftY();
      void rightHandMobile.offsetWidth;
      finalDelta = measureMobileAdjustPx();
    }
  }

  function updateMobileShift() {
    updateMobileShiftY();
  }

  /** 窄屏时缩放并保持右缘贴边；宽屏 push-out 为 0 */
  function updatePushOut() {
    if (window.__heroHandAnimating) return;

    root.style.setProperty("--hand-push-out", "0px");
    if (!isMobileHands()) {
      root.style.setProperty("--hand-mobile-scale", "1");
      void rightHandDesktop.offsetWidth;
    }

    requestAnimationFrame(() => {
      if (isMobileHands()) {
        updateMobileScale();
        requestAnimationFrame(() => {
          updateLift();
          if (!window.__heroLayoutReady) {
            window.__heroLayoutReady = true;
            window.dispatchEvent(new CustomEvent("hero-layout-ready"));
          }
        });
        return;
      }

      void rightHandDesktop.offsetWidth;
      updateDesktopShiftY();
      updateDesktopAnchors();
      updateDesktopShiftY();
      updateDesktopAnchors();
      root.style.setProperty("--hand-push-out", "0px");
      void rightHandDesktop.offsetWidth;

      let push = 0;

      for (let i = 0; i < 8; i += 1) {
        root.style.setProperty("--hand-push-out", `${push}px`);
        void rightHandDesktop.offsetWidth;
        const need = measurePushOutPx();
        if (need <= 0.5) break;
        push = Math.min(maxPushOut(), push + need);
      }

      root.style.setProperty("--hand-push-out", `${Math.round(push)}px`);

      const { overlapL, overlapR } = measureDesktopEdgeDeltaPx();
      if (overlapL > 0.5 || overlapR > 0.5) {
        push = Math.min(
          maxPushOut(),
          push + Math.max(overlapL, overlapR) + DESKTOP_GAP_SAFE
        );
        root.style.setProperty("--hand-push-out", `${Math.round(push)}px`);
      }

      requestAnimationFrame(() => {
        updateLift();
        if (!window.__heroLayoutReady) {
          window.__heroLayoutReady = true;
          window.dispatchEvent(new CustomEvent("hero-layout-ready"));
        }
      });
    });
  }

  let layoutFrame = null;

  function scheduleUpdate() {
    if (layoutFrame != null) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = null;
      updatePushOut();
    });
  }

  scheduleUpdate();
  window.addEventListener("resize", scheduleUpdate);
  if (document.fonts) {
    document.fonts.ready.then(scheduleUpdate);
  }
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(subtitle);
    ro.observe(titleEl);
    ro.observe(titleBlock);
    if (titleNameEl) ro.observe(titleNameEl);
  }
  leftHand.addEventListener("load", scheduleUpdate);
  rightHandDesktop.addEventListener("load", scheduleUpdate);
  rightHandMobile.addEventListener("load", scheduleUpdate);
})();
