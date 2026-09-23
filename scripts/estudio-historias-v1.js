(() => {
  const year = document.querySelector('[data-studio-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const sections = [...document.querySelectorAll('main [id]')];
  const links = [...document.querySelectorAll('.studio-nav a[href^="#"]')];
  if (!sections.length || !links.length) return;

  const setCurrent = (id) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${id}`;
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setCurrent(visible.target.id);
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0.12, 0.3, 0.6]
  });

  sections.forEach((section) => observer.observe(section));
})();
