(() => {
  const book = document.querySelector('.notebook');
  const edge = book.querySelector('.notebook__opener');
  const button = book.querySelector('.notebook__toggle');
  const closed = book.querySelector('.notebook__closed');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, targetOpen = false;
  function finish() {
    clearTimeout(timer);
    book.dataset.notebookState = targetOpen ? 'open' : 'closed';
    book.setAttribute('aria-label', `${targetOpen ? 'Open' : 'Closed'} A Work in Progress notebook`);
    closed.inert = targetOpen;
    edge.hidden = targetOpen;
    button.setAttribute('aria-disabled', 'false');
    button.querySelector('span:last-child').textContent = targetOpen ? 'Close notebook' : 'Open notebook';
    button.querySelector('span:first-child').textContent = targetOpen ? '↙' : '↗';
    [button, edge].forEach(control => control.setAttribute('aria-expanded', String(targetOpen)));
    book.querySelector('.notebook__status').textContent = `Notebook ${targetOpen ? 'opened' : 'closed'}.`;
  }
  function toggle() {
    const state = book.dataset.notebookState;
    if (!['closed', 'open'].includes(state) || closed.querySelector('.is-held')) return;
    targetOpen = state === 'closed';
    book.dataset.notebookState = targetOpen ? 'opening' : 'closing';
    closed.inert = true;
    edge.hidden = true;
    button.setAttribute('aria-disabled', 'true');
    if (motion.matches) finish();
    else timer = setTimeout(finish, targetOpen ? 1450 : 700);
  }
  button.addEventListener('click', toggle);
  edge.addEventListener('click', toggle);
  motion.addEventListener('change', () => {
    if (motion.matches && ['opening','closing'].includes(book.dataset.notebookState)) finish();
  });
})();
