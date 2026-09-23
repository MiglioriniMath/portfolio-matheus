(() => {
  const year = document.querySelector('[data-studio-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const sections = [...document.querySelectorAll('main [id]')];
  const links = [...document.querySelectorAll('.studio-nav a[href^="#"]')];

  const setCurrent = (id) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${id}`;
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  if (sections.length && links.length && 'IntersectionObserver' in window) {
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
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.reference-card')];

  function applyFilter(filter) {
    cards.forEach((card) => {
      const tags = card.dataset.tags || '';
      const visible = filter === 'all' || tags.includes(filter);
      card.classList.toggle('is-hidden', !visible);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      applyFilter(button.dataset.filter || 'all');
    });
  });

  const modal = document.getElementById('reference-modal');
  const close = modal?.querySelector('.reference-close');
  const fields = {
    type: modal?.querySelector('[data-modal-type]'),
    goal: modal?.querySelector('[data-modal-goal]'),
    title: modal?.querySelector('[data-modal-title]'),
    analysis: modal?.querySelector('[data-modal-analysis]'),
    use: modal?.querySelector('[data-modal-use]'),
    techniques: modal?.querySelector('[data-modal-techniques]'),
    link: modal?.querySelector('[data-modal-link]')
  };

  function openReference(card) {
    if (!modal) return;

    if (fields.type) fields.type.textContent = card.dataset.type || 'Referência';
    if (fields.goal) fields.goal.textContent = card.dataset.goal || 'Referência';
    if (fields.title) fields.title.textContent = card.dataset.title || 'Referência';
    if (fields.analysis) fields.analysis.textContent = card.dataset.analysis || '';
    if (fields.use) fields.use.textContent = card.dataset.use || '';
    if (fields.techniques) fields.techniques.textContent = card.dataset.techniques || '';
    if (fields.link) fields.link.textContent = card.dataset.link || '';

    modal.showModal();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openReference(card));
  });

  close?.addEventListener('click', () => modal?.close());
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
})();
