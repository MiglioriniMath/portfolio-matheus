(() => {
  const modal = document.getElementById("portfolio-modal");
  const player = modal?.querySelector(".portfolio-player");
  const title = modal?.querySelector(".portfolio-modal-title");
  const close = modal?.querySelector(".portfolio-close");
  const cards = [...document.querySelectorAll(".portfolio-card")];

  if (!modal || !player || !cards.length) return;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const shouldPrewarm = !connection?.saveData && !/2g/.test(connection?.effectiveType || "");
  const warmed = new Map();

  function warmVideo(card) {
    if (!shouldPrewarm) return;
    const src = card.dataset.video;
    if (!src || warmed.has(src)) return;

    const warm = document.createElement("video");
    warm.preload = "metadata";
    warm.muted = true;
    warm.playsInline = true;
    warm.src = src;
    warmed.set(src, warm);
    warm.load();
  }

  function openVideo(card) {
    const src = card.dataset.video || "";
    player.poster = card.dataset.poster || "";
    player.preload = "auto";
    player.src = src;
    if (title) title.textContent = card.dataset.title || "Vídeo";
    modal.showModal();
    player.load();
    const promise = player.play();
    if (promise?.catch) promise.catch(() => {});
  }

  function resetVideo() {
    player.pause();
    player.removeAttribute("src");
    player.removeAttribute("poster");
    player.preload = "none";
    player.load();
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openVideo(card));
    card.addEventListener("pointerenter", () => warmVideo(card), { once: true, passive: true });
    card.addEventListener("focus", () => warmVideo(card), { once: true, passive: true });
    card.addEventListener("touchstart", () => warmVideo(card), { once: true, passive: true });
  });

  if (shouldPrewarm && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        warmVideo(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "260px 0px" });

    cards.forEach((card) => observer.observe(card));
  }

  const warmFirst = () => cards.slice(0, 2).forEach(warmVideo);
  if ("requestIdleCallback" in window) requestIdleCallback(warmFirst, { timeout: 1400 });
  else window.setTimeout(warmFirst, 900);

  close?.addEventListener("click", () => modal.close());
  modal.addEventListener("close", resetVideo);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
})();
