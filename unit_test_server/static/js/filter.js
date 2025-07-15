// static/js/filter.js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('test-search');
  const mobileInput = document.getElementById('mobile-search-input');
  const cardsRoot = document.getElementById('tests-container');
  const tableBody = document.getElementById('results-table');
  if (!input || !cardsRoot || !tableBody) return;

  // 1) One function that grabs the *current* rows & cards, and hides/shows them
  function applyFilter() {
    const term = input.value.trim().toLowerCase();
    const cards = cardsRoot.querySelectorAll('.test-card');
    const rows = tableBody.querySelectorAll('tr');

    cards.forEach(c => {
      const txt = c.textContent.toLowerCase();
      c.style.display = (!term || txt.includes(term)) ? '' : 'none';
    });
    rows.forEach(r => {
      const txt = r.textContent.toLowerCase();
      r.style.display = (!term || txt.includes(term)) ? '' : 'none';
    });
  }

  // 2) Expose it globally so other code (e.g. updateResultsTable) can call it
  window.applyFilter = applyFilter;

  // 3) Debounce your keystrokes
  let timer;
  function debouncedFilter() {
    clearTimeout(timer);
    timer = setTimeout(applyFilter, 150);
  }

  // 4) Sync desktop + mobile inputs, then debounce
  function onInput(e) {
    const v = e.target.value;
    if (e.target === input && mobileInput) mobileInput.value = v;
    if (e.target === mobileInput) input.value = v;
    debouncedFilter();
  }

  input.addEventListener('input', onInput);
  mobileInput?.addEventListener('input', onInput);

  // 5) Initial filter pass (in case you have a saved term or placeholder)
  applyFilter();
});
