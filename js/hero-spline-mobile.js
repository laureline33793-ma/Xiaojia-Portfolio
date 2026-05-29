/**
 * Mobile hero: random look directions; rest slightly right; moves as soon as mouth appears.
 */
(function heroSplineMobile() {
  const MOBILE_MQ = "(max-width: 560px)";
  const SMOOTHING = 0.062;
  const LOOK_RANGE_X_RATIO = 1.05;
  const LOOK_RANGE_Y_UP_RATIO = 0.58;
  const LOOK_RANGE_Y_DOWN_RATIO = 0.38;
  const REST_NUDGE_X = 32;
  const POSE_HOLD_MIN_MS = 650;
  const POSE_HOLD_MAX_MS = 1200;
  const REST_HOLD_MIN_MS = 480;
  const REST_HOLD_MAX_MS = 820;
  const REST_CHANCE = 0.22;

  const DIRECTIONS = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -0.75, dy: -0.75 },
    { dx: 0.75, dy: -0.75 },
    { dx: -0.75, dy: 0.55 },
    { dx: 0.75, dy: 0.55 },
    { dx: -0.45, dy: -0.9 },
    { dx: 0.55, dy: -0.85 },
    { dx: -0.9, dy: 0.35 },
    { dx: 0.35, dy: 0.7 },
  ];

  let running = false;
  let decorLive = false;
  let splineReady = false;
  let splineApp = null;
  let poseUntil = 0;
  let targetX = 0;
  let targetY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let lastTargetX = 0;
  let lastTargetY = 0;
  let rafId = null;
  let canvas = null;

  function isMobile() {
    return window.matchMedia(MOBILE_MQ).matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getMouthAnchor() {
    const face = document.getElementById("spline-face");
    const el = face || canvas;
    if (!el) {
      return {
        x: window.innerWidth * 0.5 + REST_NUDGE_X,
        y: window.innerHeight * 0.34,
        rangeX: window.innerWidth * 0.22,
        rangeY: window.innerHeight * 0.12,
      };
    }

    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.42,
      rangeX: rect.width * LOOK_RANGE_X_RATIO,
      rangeY: rect.height * LOOK_RANGE_Y_UP_RATIO,
      rangeYDown: rect.height * LOOK_RANGE_Y_DOWN_RATIO,
    };
  }

  function restTarget(anchor) {
    return {
      x: anchor.x + REST_NUDGE_X,
      y: anchor.y,
    };
  }

  function randomPoseTarget(anchor, avoid) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const spread = 0.62 + Math.random() * 0.42;
      const yScale = dir.dy < 0 ? anchor.rangeY : anchor.rangeYDown;

      const point = {
        x: anchor.x + REST_NUDGE_X + dir.dx * anchor.rangeX * spread,
        y: anchor.y + dir.dy * yScale * spread,
      };

      if (!avoid) return point;

      const dist = Math.hypot(point.x - avoid.x, point.y - avoid.y);
      if (dist > 28) return point;
    }

    const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const spread = 0.8;
    const yScale = dir.dy < 0 ? anchor.rangeY : anchor.rangeYDown;
    return {
      x: anchor.x + REST_NUDGE_X + dir.dx * anchor.rangeX * spread,
      y: anchor.y + dir.dy * yScale * spread,
    };
  }

  function randomHoldMs(rest) {
    if (rest) {
      return (
        REST_HOLD_MIN_MS +
        Math.random() * (REST_HOLD_MAX_MS - REST_HOLD_MIN_MS)
      );
    }
    return POSE_HOLD_MIN_MS + Math.random() * (POSE_HOLD_MAX_MS - POSE_HOLD_MIN_MS);
  }

  function scheduleNextPose(now, preferRest = false) {
    const anchor = getMouthAnchor();
    const rest = restTarget(anchor);
    const useRest = preferRest || (Math.random() < REST_CHANCE && poseUntil > 0);

    let next;
    if (useRest) {
      next = rest;
    } else {
      next = randomPoseTarget(anchor, { x: lastTargetX, y: lastTargetY });
    }

    lastTargetX = targetX;
    lastTargetY = targetY;
    targetX = next.x;
    targetY = next.y;
    poseUntil = now + randomHoldMs(useRest);
  }

  function buildPointerEvent(x, y) {
    return new PointerEvent("pointermove", {
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      screenX: x,
      screenY: y,
      pointerId: 1,
      pointerType: "mouse",
      buttons: 0,
      bubbles: true,
      cancelable: true,
      view: window,
    });
  }

  function pushSplineLook(x, y) {
    canvas = document.getElementById("canvas3d");
    if (!canvas?.isConnected) return;

    const evt = buildPointerEvent(x, y);
    const lookAt = splineApp?._eventManager?.handlers?.LookAt;

    if (lookAt?.events?.length && lookAt.eventContext) {
      const ctx = lookAt.eventContext;
      ctx.domRect = canvas.getBoundingClientRect();
      ctx.updateRaycaster(evt);

      for (const item of lookAt.events) {
        if (item.target === void 0) {
          lookAt.updateSingleEvent(item);
        }
      }

      ctx.requestRender?.();
      return;
    }

    canvas.dispatchEvent(evt);
  }

  function tick(now) {
    if (now >= poseUntil) {
      scheduleNextPose(now);
    }

    smoothX += (targetX - smoothX) * SMOOTHING;
    smoothY += (targetY - smoothY) * SMOOTHING;
    pushSplineLook(smoothX, smoothY);
    rafId = requestAnimationFrame(tick);
  }

  function stopAutoLook() {
    running = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function startAutoLook() {
    if (running || !isMobile() || !decorLive || !splineReady) return;
    if (prefersReducedMotion()) return;

    canvas = document.getElementById("canvas3d");
    if (!canvas?.isConnected) return;

    if (splineApp?.setGlobalEvents) {
      splineApp.setGlobalEvents(true);
    }

    const anchor = getMouthAnchor();
    const rest = restTarget(anchor);
    running = true;

    smoothX = rest.x;
    smoothY = rest.y;
    lastTargetX = rest.x;
    lastTargetY = rest.y;

    const first = randomPoseTarget(anchor, rest);
    targetX = first.x;
    targetY = first.y;
    poseUntil = performance.now() + 280;

    pushSplineLook(smoothX, smoothY);

    if (rafId == null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function tryStart(retries = 0) {
    if (!isMobile() || !decorLive || !splineReady) return;

    canvas = document.getElementById("canvas3d");
    if (!canvas?.isConnected) {
      if (retries < 24) {
        requestAnimationFrame(() => tryStart(retries + 1));
      }
      return;
    }

    startAutoLook();
  }

  window.addEventListener(
    "hero-decor-live",
    () => {
      decorLive = true;
      tryStart();
    },
    { once: true }
  );

  window.addEventListener(
    "hero-spline-ready",
    (event) => {
      splineApp = event.detail?.app ?? null;
      splineReady = true;
      tryStart();
    },
    { once: true }
  );

  let layoutTimer = null;
  window.addEventListener("hero-layout-ready", () => {
    if (!running) return;
    window.clearTimeout(layoutTimer);
    layoutTimer = window.setTimeout(() => {
      const anchor = getMouthAnchor();
      const rest = restTarget(anchor);
      smoothX = rest.x;
      smoothY = rest.y;
      scheduleNextPose(performance.now());
      pushSplineLook(smoothX, smoothY);
    }, 120);
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) stopAutoLook();
  });
})();
