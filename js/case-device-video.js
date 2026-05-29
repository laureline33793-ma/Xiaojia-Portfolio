/**
 * Case study — autoplay muted device preview videos (Website & App, etc.).
 */
(function caseDeviceVideo() {
  const videos = [...document.querySelectorAll(".case-device__video")];
  if (videos.length === 0) return;

  const playAll = () => {
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {});
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", playAll);
  } else {
    playAll();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach((v) => v.pause());
    } else {
      playAll();
    }
  });
})();
