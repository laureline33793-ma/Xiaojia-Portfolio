(function siteContactScroll() {
  const CONTACT_HASH = "#contact";

  function scrollToContactSection(behavior = "smooth") {
    const contact = document.getElementById("contact");
    if (!contact) return;

    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    contact.scrollIntoView({ block: "start", behavior });
    root.style.scrollBehavior = prev;
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${CONTACT_HASH}`
    );
  }

  if (window.location.hash === CONTACT_HASH) {
    const run = () => scrollToContactSection("instant");
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  document
    .querySelectorAll('.site-nav a[href="#contact"], .site-nav a[href$="#contact"]')
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!document.getElementById("contact")) return;
        event.preventDefault();
        scrollToContactSection("smooth");
      });
    });
})();
