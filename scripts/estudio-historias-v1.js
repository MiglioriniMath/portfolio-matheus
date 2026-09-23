(() => {
  const year = document.querySelector('[data-studio-year]');
  if (year) year.textContent = String(new Date().getFullYear());

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
    if (!modal || card.matches('a[href]')) return;

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

  const radarForm = document.querySelector('[data-radar-form]');
  const radarSummary = document.querySelector('[data-radar-summary]');
  const radarTitle = document.getElementById('radar-result-title');

  radarForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(radarForm);
    const business = String(data.get('business') || 'Este perfil').trim() || 'Este perfil';
    const area = String(data.get('area') || 'segmento informado').trim() || 'segmento informado';
    const goal = String(data.get('goal') || 'organizar conteúdo');

    if (radarTitle) radarTitle.textContent = 'Boa base, oportunidade clara de direção.';
    if (radarSummary) {
      radarSummary.textContent = `${business} parece ter espaço para fortalecer presença no segmento de ${area}. O primeiro caminho é organizar a comunicação para ${goal}, com uma linha visual mais consistente e conteúdos que expliquem valor antes de pedir atenção.`;
    }
  });
})();
