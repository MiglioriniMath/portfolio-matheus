(() => {
  function isPostPage() {
    return window.location.pathname.includes("/posts/");
  }

  function isHomePage() {
    const path = window.location.pathname;
    return path === "/" || path.endsWith("/index.html");
  }

  function pathPrefix() {
    return isPostPage() ? "../" : "";
  }

  function isActive(section) {
    const path = window.location.pathname;
    if (section === "work") return path.endsWith("/work.html");
    if (section === "notes") return path.endsWith("/notes.html") || path.includes("/posts/");
    if (section === "about") return path.endsWith("/about.html");
    return false;
  }

  function ensureShellStyles() {
    const prefix = pathPrefix();
    const href = `${prefix}styles/site-shell-v1.css`;
    const alreadyLoaded = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .some((link) => (link.getAttribute("href") || "").endsWith("styles/site-shell-v1.css"));

    if (alreadyLoaded) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function headerTemplate() {
    const prefix = pathPrefix();
    const current = (section) => isActive(section) ? ' aria-current="page"' : "";
    const homeClass = isHomePage() ? " mac-header" : "";

    return `
      <header class="site-header${homeClass}" data-shell-header>
        <a class="brand brand-mark" href="${prefix}index.html" aria-label="Ir para a Home">ML</a>
        <nav class="nav" aria-label="Navegação principal">
          <a href="${prefix}work.html"${current("work")}>Portfólio Criativo</a>
          <a href="${prefix}notes.html"${current("notes")}>Anotações</a>
          <a href="${prefix}about.html"${current("about")}>Sobre Mim</a>
        </nav>
        <a class="talk-button" href="https://wa.me/5515991878897" target="_blank" rel="noreferrer"><span>Fale comigo</span><span class="talk-arrow" aria-hidden="true">→</span></a>
        <a class="mobile-instagram-button" href="https://www.instagram.com/migliorinimath/" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4.5" y="4.5" width="15" height="15" rx="4.5"></rect>
            <circle cx="12" cy="12" r="3.4"></circle>
            <circle cx="17.2" cy="6.8" r=".8"></circle>
          </svg>
        </a>
      </header>
    `;
  }

  function mountHeader() {
    ensureShellStyles();

    const template = document.createElement("template");
    template.innerHTML = headerTemplate().trim();
    const header = template.content.firstElementChild;
    const placeholder = document.querySelector("[data-site-header]");
    const existing = document.querySelector(".site-header");
    const main = document.querySelector("main.shell") || document.querySelector("main") || document.body;

    if (placeholder) {
      placeholder.replaceWith(header);
    } else if (existing) {
      existing.replaceWith(header);
    } else {
      main.prepend(header);
    }

    document.documentElement.classList.add("site-shell-ready");
  }

  window.SiteShell = { mountHeader };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountHeader, { once: true });
  } else {
    mountHeader();
  }
})();
