(() => {
  const modal = document.getElementById("portfolio-modal");
  const player = modal?.querySelector(".portfolio-player");
  const title = modal?.querySelector(".portfolio-modal-title");
  const close = modal?.querySelector(".portfolio-close");
  const cards = [...document.querySelectorAll(".portfolio-card")];

  if (!modal || !player || !cards.length) return;

  function openVideo(card) {
    player.poster = card.dataset.poster || "";
    player.src = card.dataset.video || "";
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
    player.load();
  }

  cards.forEach((card) => card.addEventListener("click", () => openVideo(card)));
  close?.addEventListener("click", () => modal.close());
  modal.addEventListener("close", resetVideo);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
})();
