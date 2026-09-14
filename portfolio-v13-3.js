(() => {
  const modal = document.getElementById("portfolio-modal");
  const player = modal?.querySelector(".portfolio-player");
  const title = modal?.querySelector(".portfolio-modal-title");
  const description = modal?.querySelector(".portfolio-modal-description");
  const modalClient = modal?.querySelector("[data-modal-client]");
  const modalTools = modal?.querySelector("[data-modal-tools]");
  const modalType = modal?.querySelector("[data-modal-type]");
  const close = modal?.querySelector(".portfolio-close");
  const cards = [...document.querySelectorAll(".portfolio-card")];

  if (!modal || !player || !cards.length) return;

  const desktopHover = window.matchMedia("(hover:hover) and (pointer:fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const canPreview = () => desktopHover.matches && !reducedMotion.matches && !connection?.saveData && !/2g/.test(connection?.effectiveType || "");

  let hoverCard = null;
  let activeCard = null;
  let previewVideo = null;
  let hoverTimer = null;

  function clearHoverTimer() {
    if (hoverTimer) window.clearTimeout(hoverTimer);
    hoverTimer = null;
  }

  function stopPreview() {
    clearHoverTimer();

    if (!activeCard || !previewVideo) {
      activeCard = null;
      previewVideo = null;
      return;
    }

    const card = activeCard;
    const video = previewVideo;

    card.classList.remove("is-previewing");
    activeCard = null;
    previewVideo = null;

    window.setTimeout(() => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    }, 120);
  }

  function startPreview(card) {
    if (!canPreview() || hoverCard !== card) return;
    const src = card.dataset.video;
    const media = card.querySelector(".portfolio-media");
    if (!src || !media) return;

    if (activeCard === card) return;
    stopPreview();

    const video = document.createElement("video");
    video.className = "portfolio-preview";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = src;
    media.appendChild(video);

    activeCard = card;
    previewVideo = video;

    const play = () => {
      if (hoverCard !== card || activeCard !== card) return;
      card.classList.add("is-previewing");
      const promise = video.play();
      if (promise?.catch) promise.catch(() => card.classList.remove("is-previewing"));
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });
  }

  function schedulePreview(card) {
    if (!canPreview()) return;
    clearHoverTimer();
    hoverTimer = window.setTimeout(() => startPreview(card), 240);
  }

  function warmVideo(card) {
    if (connection?.saveData || /2g/.test(connection?.effectiveType || "")) return;
    const src = card.dataset.video;
    if (!src) return;
    const warm = document.createElement("video");
    warm.preload = "metadata";
    warm.muted = true;
    warm.playsInline = true;
    warm.src = src;
    warm.load();
    window.setTimeout(() => {
      warm.removeAttribute("src");
      warm.load();
    }, 1800);
  }

  function openVideo(card) {
    stopPreview();

    player.poster = card.dataset.poster || "";
    player.preload = "auto";
    player.src = card.dataset.video || "";

    if (title) title.textContent = card.dataset.title || "Vídeo";
    if (description) description.textContent = card.dataset.description || "Uma peça selecionada do meu portfólio em vídeo.";
    if (modalClient) modalClient.textContent = card.dataset.client || "Projeto autoral";
    if (modalTools) modalTools.textContent = card.dataset.tools || "CapCut · Edição · Storytelling";
    if (modalType) modalType.textContent = card.dataset.type || "Vídeo vertical · 9:16";

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

    card.addEventListener("pointerenter", () => {
      hoverCard = card;
      schedulePreview(card);
    }, { passive: true });

    card.addEventListener("pointermove", () => {
      if (hoverCard === card && !activeCard) schedulePreview(card);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      if (hoverCard === card) hoverCard = null;
      stopPreview();
    }, { passive: true });

    card.addEventListener("focus", () => warmVideo(card));
    card.addEventListener("touchstart", () => warmVideo(card), { once: true, passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPreview();
  });

  close?.addEventListener("click", () => modal.close());
  modal.addEventListener("close", resetVideo);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
})();
