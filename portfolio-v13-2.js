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

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const desktopHover = window.matchMedia("(hover:hover) and (pointer:fine)");
  const shouldWarm = !connection?.saveData && !/2g/.test(connection?.effectiveType || "");
  const warmed = new Map();
  let previewCard = null;
  let previewVideo = null;
  let previewTimer = null;

  function warmVideo(card) {
    if (!shouldWarm) return;
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

  function setPointerGlow(card, event) {
    const media = card.querySelector(".portfolio-media");
    if (!media) return;
    const rect = media.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  }

  function stopPreview() {
    if (previewTimer) window.clearTimeout(previewTimer);
    previewTimer = null;

    if (!previewCard || !previewVideo) return;
    const card = previewCard;
    const video = previewVideo;

    card.classList.remove("is-previewing");
    previewCard = null;
    previewVideo = null;

    previewTimer = window.setTimeout(() => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    }, 180);
  }

  function startPreview(card) {
    if (!desktopHover.matches || !shouldWarm) return;
    const src = card.dataset.video;
    const media = card.querySelector(".portfolio-media");
    if (!src || !media) return;

    if (previewCard === card) return;
    stopPreview();

    const video = document.createElement("video");
    video.className = "portfolio-preview";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = src;
    media.appendChild(video);

    previewCard = card;
    previewVideo = video;

    const play = () => {
      card.classList.add("is-previewing");
      const promise = video.play();
      if (promise?.catch) promise.catch(() => card.classList.remove("is-previewing"));
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });
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
    card.addEventListener("pointermove", (event) => setPointerGlow(card, event), { passive: true });
    card.addEventListener("pointerenter", () => {
      warmVideo(card);
      startPreview(card);
    }, { passive: true });
    card.addEventListener("pointerleave", stopPreview, { passive: true });
    card.addEventListener("focus", () => warmVideo(card));
    card.addEventListener("touchstart", () => warmVideo(card), { once: true, passive: true });
  });

  if (shouldWarm && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        warmVideo(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "240px 0px" });

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
