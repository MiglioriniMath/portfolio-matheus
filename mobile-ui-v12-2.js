(() => {
  const mobile = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const panel = document.querySelector(".recent-panel");
  const grid = panel?.querySelector(".mac-work-grid");
  const items = grid ? [...grid.querySelectorAll(".mac-work-item")] : [];

  const footer = document.querySelector(".mac-footer");
  const signoff = document.querySelector(".home-signoff");

  let index = 0;
  let intervalId = null;
  let leaveTimeout = null;
  let observer = null;

  function clearRotator() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
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
    if (!items.length) return;

    const current = items[index];
    const nextIndex = (index + 1) % items.length;
    const next = items[nextIndex];

    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    current.setAttribute("aria-hidden", "true");
    current.setAttribute("tabindex", "-1");

    next.classList.remove("is-leaving");
    next.classList.add("is-active");
    next.setAttribute("aria-hidden", "false");
    next.removeAttribute("tabindex");

    index = nextIndex;

    leaveTimeout = setTimeout(() => {
      current.classList.remove("is-leaving");
    }, 220);
  }

  function startRotator() {
    clearRotator();

    if (!panel || items.length < 2 || !mobile.matches) {
      panel?.classList.remove("js-ready");
      items.forEach((item) => {
        item.classList.remove("is-active", "is-leaving");
        item.removeAttribute("aria-hidden");
        item.removeAttribute("tabindex");
      });
      return;
    }

    panel.classList.add("mobile-work-rotator", "js-ready");
    index = 0;
    setActive(index);

    if (!reducedMotion.matches) {
      intervalId = setInterval(rotate, 3300);
    }
  }

  function setupFooterDock() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    footer?.classList.remove("is-visible");

    if (!footer || !signoff || !mobile.matches) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        footer.classList.toggle("is-visible", visible);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "220px 0px 0px 0px",
      }
    );

    observer.observe(signoff);
  }

  function refresh() {
    startRotator();
    setupFooterDock();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearRotator();
    } else {
      startRotator();
    }
  });

  mobile.addEventListener?.("change", refresh);
  reducedMotion.addEventListener?.("change", startRotator);

  refresh();
})();