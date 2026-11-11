(() => {
  const book = document.querySelector('.notebook');
  if (!book) return;
  const button = book.querySelector('.notebook__indicator');
  const closed = book.querySelector('.notebook__closed');
  const content = book.querySelector('.notebook-spread');
  if (content) { content.inert = true; content.setAttribute('aria-hidden', 'true'); }
  const education = book.querySelector('.notebook-spread__left');
  book.querySelectorAll('.notebook__pages i').forEach(leaf => {
    const back = document.createElement('span');
    back.className = 'notebook__printed-back';
    const print = document.createElement('span');
    print.className = 'notebook__page-print';
    const copy = education.cloneNode(true);
    copy.removeAttribute('aria-labelledby');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    print.append(copy);
    back.append(print);
    leaf.append(back);
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, targetOpen = false;
  function finish() {
    clearTimeout(timer);
    book.dataset.notebookState = targetOpen ? 'open' : 'closed';
    book.setAttribute('aria-label', `${targetOpen ? 'Open' : 'Closed'} A Work in Progress notebook`);
    closed.inert = targetOpen;
    if (content) { content.inert = !targetOpen; content.setAttribute('aria-hidden', String(!targetOpen)); }
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('aria-expanded', String(targetOpen));
    button.setAttribute('aria-label', targetOpen ? 'Close notebook' : 'Open notebook');
    button.querySelector('.notebook__hint').textContent = targetOpen ? 'Close' : 'Open';
    button.querySelector('.notebook__arrow').textContent = targetOpen ? '›' : '‹';
    book.querySelector('.notebook__status').textContent = `Notebook ${targetOpen ? 'opened' : 'closed'}.`;
  }
  button.addEventListener('click', () => {
    const state = book.dataset.notebookState;
    if (!['closed', 'open'].includes(state) || book.querySelector('.is-held')) return;
    targetOpen = state === 'closed';
    book.dataset.notebookState = targetOpen ? 'opening' : 'closing';
    book.dataset.expanded = String(targetOpen);
    closed.inert = true;
    if (content) { content.inert = true; content.setAttribute('aria-hidden', 'true'); }
    button.setAttribute('aria-disabled', 'true');
    if (motion.matches) finish();
    else timer = setTimeout(finish, targetOpen ? 1200 : 500);
  });
  motion.addEventListener('change', () => {
    if (motion.matches && ['opening', 'closing'].includes(book.dataset.notebookState)) finish();
  });
})();
