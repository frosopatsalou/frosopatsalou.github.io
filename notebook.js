(() => {
  const book = document.querySelector('.notebook');
  if (!book) return;
  const button = book.querySelector('.notebook__indicator');
  const closed = book.querySelector('.notebook__closed');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, targetOpen = false;
  function finish() {
    clearTimeout(timer);
    book.dataset.notebookState = targetOpen ? 'open' : 'closed';
    book.setAttribute('aria-label', `${targetOpen ? 'Open' : 'Closed'} A Work in Progress notebook`);
    closed.inert = targetOpen;
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('aria-expanded', String(targetOpen));
    button.setAttribute('aria-label', targetOpen ? 'Close notebook' : 'Open notebook');
    button.querySelector('.notebook__hint').textContent = targetOpen ? 'Close' : 'Open';
    button.querySelector('.notebook__arrow').textContent = targetOpen ? '›' : '‹';
    book.querySelector('.notebook__status').textContent = `Notebook ${targetOpen ? 'opened' : 'closed'}.`;
  }
  button.addEventListener('click', () => {
    const state = book.dataset.notebookState;
    if (!['closed', 'open'].includes(state) || closed.querySelector('.is-held')) return;
    targetOpen = state === 'closed';
    book.dataset.notebookState = targetOpen ? 'opening' : 'closing';
    book.dataset.expanded = String(targetOpen);
    closed.inert = true;
    button.setAttribute('aria-disabled', 'true');
    if (motion.matches) finish();
    else timer = setTimeout(finish, targetOpen ? 1200 : 500);
  });
  motion.addEventListener('change', () => {
    if (motion.matches && ['opening', 'closing'].includes(book.dataset.notebookState)) finish();
  });
})();
