/**
 * Case study hero — autoplay muted Trout Lake preview (same asset as work card).
 */
(function caseHeroVideo() {
  const video = document.querySelector(".case-hero__video");
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");

  const play = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", play);
  } else {
    play();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      video.pause();
    } else {
      play();
    }
  });
})();
