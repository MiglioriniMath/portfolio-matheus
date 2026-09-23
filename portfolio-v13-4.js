(() => {
  function ensureShellStyles() {
    const alreadyLoaded = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .some((link) => (link.getAttribute("href") || "").endsWith("styles/site-shell-v1.css"));
    if (alreadyLoaded) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles/site-shell-v1.css";
    document.head.appendChild(link);
  }

  function mountPortfolioHeader() {
    if (window.SiteShell?.mountHeader) {
      window.SiteShell.mountHeader();
      return;
    }

    ensureShellStyles();
    const existing = document.querySelector(".site-header");
    if (!existing) return;

    existing.innerHTML = `
      <a class="brand brand-mark" href="index.html" aria-label="Ir para a Home">ML</a>
      <nav class="nav" aria-label="Navegação principal">
        <a href="work.html" aria-current="page">Portfólio Criativo</a>
        <a href="notes.html">Anotações</a>
        <a href="about.html">Sobre Mim</a>
      </nav>
      <a class="talk-button" href="https://wa.me/5515991878897" target="_blank" rel="noreferrer"><span>Fale comigo</span><span class="talk-arrow" aria-hidden="true">→</span></a>
      <a class="mobile-instagram-button" href="https://www.instagram.com/migliorinimath/" target="_blank" rel="noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="4.5"></rect><circle cx="12" cy="12" r="3.4"></circle><circle cx="17.2" cy="6.8" r=".8"></circle></svg>
      </a>
    `;
  }

  mountPortfolioHeader();

  const modal = document.getElementById("portfolio-modal");
  const player = modal?.querySelector(".portfolio-player");
  const title = modal?.querySelector(".portfolio-modal-title");
  const description = modal?.querySelector(".portfolio-modal-description");
  const modalClient = modal?.querySelector("[data-modal-client]");
  const modalTools = modal?.querySelector("[data-modal-tools]");
  const modalType = modal?.querySelector("[data-modal-type]");
  const results = modal?.querySelector(".portfolio-results");
  const resultsViews = modal?.querySelector("[data-modal-results-views]");
  const resultsLikes = modal?.querySelector("[data-modal-results-likes]");
  const resultsShares = modal?.querySelector("[data-modal-results-shares]");
  const resultsFollowers = modal?.querySelector("[data-modal-results-followers]");
  const resultsNote = modal?.querySelector("[data-modal-results-note]");
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

  function updateModal(card) {
    if (title) title.textContent = card.dataset.title || "Vídeo";
    if (description) description.textContent = card.dataset.description || "Uma peça selecionada do meu portfólio em vídeo.";
    if (modalClient) modalClient.textContent = card.dataset.client || "Projeto autoral";
    if (modalTools) modalTools.textContent = card.dataset.tools || "CapCut · Edição · Storytelling";
    if (modalType) modalType.textContent = card.dataset.type || "Vídeo vertical · 9:16";

    if (resultsViews) resultsViews.textContent = card.dataset.resultsViews || "A preencher";
    if (resultsLikes) resultsLikes.textContent = card.dataset.resultsLikes || "A preencher";
    if (resultsShares) resultsShares.textContent = card.dataset.resultsShares || "A preencher";
    if (resultsFollowers) resultsFollowers.textContent = card.dataset.resultsFollowers || "A preencher";
    if (resultsNote) resultsNote.textContent = card.dataset.resultsNote || "Espaço reservado para registrar o resultado da peça e uma consideração sobre o desempenho.";
    if (results) results.open = false;
  }

  function openVideo(card) {
    player.pause();
    player.poster = card.dataset.poster || "";
    player.preload = "auto";
    player.src = card.dataset.video || "";

    updateModal(card);
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
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && modal.open) resetVideo();
  });
})();
