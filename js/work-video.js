/**
 * Work videos: play in view (muted). Sound toggle on hover+click — except Trout Lake (always silent).
 */
(function workVideo() {
  const ICON_WAVES = "assets/works/volume-on.png?v=4";
  const ICON_X = "assets/works/volume-mute.png?v=4";
  const HIDE_DELAY_MS = 1000;

  const cards = [...document.querySelectorAll(".work-card")].filter((card) =>
    card.querySelector(".work-card__bg-video")
  );

  if (!cards.length) return;

  const cardState = new Map();

  function muteVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
  }

  function unmuteVideo(video) {
    video.muted = false;
    video.defaultMuted = false;
    video.removeAttribute("muted");
  }

  function setSoundOn(card, on) {
    const state = cardState.get(card);
    if (!state || state.noSound) return;
    state.soundOn = on;
    card.dataset.sound = on ? "on" : "off";
    state.btn.setAttribute("aria-label", on ? "Mute sound" : "Play sound");
    if (on) {
      unmuteVideo(state.video);
    } else {
      muteVideo(state.video);
    }
  }

  function muteAllSoundCards() {
    cards.forEach((card) => {
      const state = cardState.get(card);
      if (state && !state.noSound) setSoundOn(card, false);
    });
  }

  function enableSoundFor(card) {
    muteAllSoundCards();
    setSoundOn(card, true);
  }

  function showSoundUi(card) {
    const state = cardState.get(card);
    if (!state || state.noSound) return;
    window.clearTimeout(state.hideTimer);
    card.classList.add("is-sound-ui-visible");
  }

  function scheduleHideSoundUi(card) {
    const state = cardState.get(card);
    if (!state || state.noSound) return;
    window.clearTimeout(state.hideTimer);
    state.hideTimer = window.setTimeout(() => {
      card.classList.remove("is-sound-ui-visible");
    }, HIDE_DELAY_MS);
  }

  cards.forEach((card) => {
    const video = card.querySelector(".work-card__bg-video");
    const frame = card.querySelector(".work-card__frame");
    if (!video || !frame) return;

    const noSound = card.classList.contains("work-card--trout-lake");
    card.classList.add("work-card--has-video");
    if (noSound) {
      card.classList.add("work-card--video-silent");
    }

    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    muteVideo(video);

    let btn = null;

    if (!noSound) {
      const sound = document.createElement("div");
      sound.className = "work-card__sound";
      sound.innerHTML = `
        <button type="button" class="work-card__sound-btn">
          <span class="work-card__sound-glass" aria-hidden="true"></span>
          <img class="work-card__sound-icon work-card__sound-icon--when-muted" src="${ICON_X}" alt="" width="36" height="36" />
          <img class="work-card__sound-icon work-card__sound-icon--when-sound" src="${ICON_WAVES}" alt="" width="36" height="36" />
        </button>
      `;
      frame.appendChild(sound);
      btn = sound.querySelector(".work-card__sound-btn");
      card.dataset.sound = "off";

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = cardState.get(card);
        if (!state || state.noSound) return;
        if (state.soundOn) {
          setSoundOn(card, false);
        } else {
          enableSoundFor(card);
        }
      });

      card.addEventListener("mouseenter", () => showSoundUi(card));
      card.addEventListener("mouseleave", () => scheduleHideSoundUi(card));
      sound.addEventListener("mouseenter", () => showSoundUi(card));
      sound.addEventListener("mouseleave", () => scheduleHideSoundUi(card));
    }

    cardState.set(card, {
      video,
      btn,
      noSound,
      soundOn: false,
      hideTimer: null,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const state = cardState.get(card);
          if (!state) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
            if (!state.noSound) setSoundOn(card, false);
            card.classList.remove("is-sound-ui-visible");
          }
        });
      },
      { threshold: 0.28, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(card);
  });
})();
