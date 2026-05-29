(function aboutCopyEmail() {
  const btn = document.querySelector("[data-copy-email]");
  if (!btn) return;

  const email = btn.querySelector("span")?.textContent?.trim() || "";

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      const label = btn.querySelector("span");
      if (!label) return;
      const original = label.textContent;
      label.textContent = "Copied!";
      window.setTimeout(() => {
        label.textContent = original;
      }, 1600);
    } catch {
      window.prompt("Copy email:", email);
    }
  });
})();
