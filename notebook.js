(() => {
  const book = document.querySelector('.notebook');
  const button = book.querySelector('.notebook__opener');
  const closed = book.querySelector('.notebook__closed');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  function finish() {
    clearTimeout(timer);
    book.dataset.notebookState = 'open';
    book.setAttribute('aria-label', 'Open project notebook');
    book.querySelector('.notebook__status').textContent = 'Project notebook opened.';
  }
  button.addEventListener('click', () => {
    if (book.dataset.notebookState !== 'closed' || closed.querySelector('.is-held')) return;
    book.dataset.notebookState = 'opening';
    book.setAttribute('aria-label', 'Opening project notebook');
    closed.inert = true;
    button.setAttribute('aria-expanded', 'true');
    button.hidden = true;
    if (motion.matches) finish();
    else timer = setTimeout(finish, 1450);
  });
  motion.addEventListener('change', () => {
    if (motion.matches && book.dataset.notebookState === 'opening') finish();
  });
})();
