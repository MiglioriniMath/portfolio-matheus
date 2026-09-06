(() => {
  const mq = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const panel = document.querySelector(".recent-panel");
  const grid = panel?.querySelector(".mac-work-grid");
  const items = grid ? [...grid.querySelectorAll(".mac-work-item")] : [];
  const dock = document.querySelector(".mobile-contact-dock");
  const signoff = document.querySelector(".home-signoff");

  let index = 0;
  let intervalId = null;
  let leaveTimeout = null;
  let observer = null;

  function stopRotator() {
    if (intervalId) clearInterval(intervalId);
    if (leaveTimeout) clearTimeout(leaveTimeout);
    intervalId = null;
    leaveTimeout = null;
  }

  function setActive(i) {
    items.forEach((item, n) => {
      const active = n === i;
      item.classList.toggle("is-active", active);
      item.classList.remove("is-leaving");
      item.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) item.removeAttribute("tabindex");
      else item.setAttribute("tabindex", "-1");
    });
  }

  function rotate() {
    const current = items[index];
    const nextIndex = (index + 1) % items.length;
    const next = items[nextIndex];

    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    current.setAttribute("aria-hidden", "true");
    current.setAttribute("tabindex", "-1");

    next.classList.add("is-active");
    next.setAttribute("aria-hidden", "false");
    next.removeAttribute("tabindex");

    index = nextIndex;

    leaveTimeout = setTimeout(() => {
      current.classList.remove("is-leaving");
    }, 220);
  }

  function setupRotator() {
    stopRotator();

    if (!panel || items.length < 2 || !mq.matches) {
      panel?.classList.remove("mobile-work-rotator");
      items.forEach((item) => {
        item.classList.remove("is-active", "is-leaving");
        item.removeAttribute("aria-hidden");
        item.removeAttribute("tabindex");
      });
      return;
    }

    panel.classList.add("mobile-work-rotator");
    index = 0;
    setActive(index);

    if (!reducedMotion.matches) {
      intervalId = setInterval(rotate, 3300);
    }
  }

  function setupDock() {
    if (observer) observer.disconnect();
    observer = null;

    if (!dock) return;
    dock.classList.remove("is-visible");

    if (!mq.matches || !signoff) return;

    observer = new IntersectionObserver(
      (entries) => {
        const nearBottom = entries.some((entry) => entry.isIntersecting);
        dock.classList.toggle("is-visible", nearBottom);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "180px 0px 0px 0px"
      }
    );

    observer.observe(signoff);
  }

  function refresh() {
    setupRotator();
    setupDock();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopRotator();
    else setupRotator();
  });

  mq.addEventListener?.("change", refresh);
  reducedMotion.addEventListener?.("change", setupRotator);

  refresh();
})();