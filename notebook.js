(() => {
  const book = document.querySelector('.notebook');
  if (!book) return;
  const button = book.querySelector('.notebook__indicator');
  const closed = book.querySelector('.notebook__closed');
  const spreads = [...book.querySelectorAll('.notebook__open > .notebook-spread')];
  const educationSpread = spreads.find(spread => spread.dataset.spread === 'education');
  const education = educationSpread.querySelector('.notebook-spread__left');
  const bookmarks = [...book.querySelectorAll('[data-notebook-page]')];
  const status = book.querySelector('.notebook__status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer, targetOpen = false, currentSpread = 'education', turning = false;
  let turnAnimation = null, finishTurn = null;

  function syncAccess() {
    const open = book.dataset.notebookState === 'open';
    spreads.forEach(spread => {
      const active = open && !turning && spread.dataset.spread === currentSpread;
      spread.inert = !active;
      spread.setAttribute('aria-hidden', String(!active));
    });
    bookmarks.forEach(mark => { mark.disabled = !open || turning; });
  }
  function showSpread(name) {
    currentSpread = name;
    book.dataset.activeSpread = name;
    spreads.forEach(spread => { spread.hidden = spread.dataset.spread !== name; });
    syncAccess();
  }

  // Only the final opening leaf is printed; the earlier leaves stay blank.
  const openingLeaf = book.querySelector('.notebook__pages i:first-child');
  const openingBack = document.createElement('span');
  openingBack.className = 'notebook__printed-back';
  const openingPrint = document.createElement('span');
  openingPrint.className = 'notebook__page-print';
  const educationCopy = education.cloneNode(true);
  educationCopy.removeAttribute('aria-labelledby');
  educationCopy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  openingPrint.append(educationCopy);
  openingBack.append(openingPrint);
  openingLeaf.append(openingBack);
  showSpread(currentSpread);

  function finish() {
    clearTimeout(timer);
    book.dataset.notebookState = targetOpen ? 'open' : 'closed';
    book.setAttribute('aria-label', `${targetOpen ? 'Open' : 'Closed'} A Work in Progress notebook`);
    closed.inert = targetOpen;
    syncAccess();
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('aria-expanded', String(targetOpen));
    button.setAttribute('aria-label', targetOpen ? 'Close notebook' : 'Open notebook');
    button.querySelector('.notebook__hint').textContent = targetOpen ? 'Close' : 'Open';
    button.querySelector('.notebook__arrow').textContent = targetOpen ? '›' : '‹';
    status.textContent = `Notebook ${targetOpen ? 'opened' : 'closed'}.`;
  }
  button.addEventListener('click', () => {
    const state = book.dataset.notebookState;
    if (turning || !['closed', 'open'].includes(state) || book.querySelector('.is-held')) return;
    targetOpen = state === 'closed';
    book.dataset.notebookState = targetOpen ? 'opening' : 'closing';
    book.dataset.expanded = String(targetOpen);
    closed.inert = true;
    syncAccess();
    button.setAttribute('aria-disabled', 'true');
    if (motion.matches) finish();
    else {
      const closingDuration = parseFloat(getComputedStyle(book).getPropertyValue('--notebook-hinge-duration')) || 840;
      timer = setTimeout(finish, targetOpen ? 1200 : closingDuration + 40);
    }
  });

  function printedSkills() {
    const source = educationSpread.querySelector('.notebook-spread__right');
    const copy = source.cloneNode(true);
    copy.removeAttribute('aria-labelledby');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    const originals = source.querySelectorAll('.notebook-skill');
    copy.querySelectorAll('.notebook-skill').forEach((tile, index) => {
      // Flatten the live peel renderer to its original artwork for a cheap, static leaf.
      tile.querySelectorAll('.peel-art').forEach(svg => svg.remove());
      tile.querySelector('img').classList.remove('peel-source');
      tile.style.translate = getComputedStyle(originals[index]).translate;
      tile.classList.remove('is-draggable', 'is-held');
      ['data-movable', 'tabindex', 'role', 'aria-pressed', 'aria-describedby'].forEach(attribute => tile.removeAttribute(attribute));
    });
    return copy;
  }
  function turnTo(name) {
    if (turning || name === currentSpread || book.dataset.notebookState !== 'open' || book.querySelector('.is-held')) return;
    const destination = spreads.find(spread => spread.dataset.spread === name);
    if (!destination) return;
    const forward = name === 'interests';
    if (motion.matches) {
      showSpread(name);
      destination.querySelector('[data-notebook-page]').focus({preventScroll: true});
      status.textContent = name === 'interests' ? 'Interests pages. Currently blank.' : 'Education and Skills pages.';
      return;
    }
    const leaf = document.createElement('div');
    leaf.className = 'notebook__spread-turn';
    leaf.setAttribute('aria-hidden', 'true');
    const front = document.createElement('div');
    front.className = 'notebook__turn-front';
    const print = document.createElement('div');
    print.className = 'notebook__turn-print';
    // Unhide before reading the saved sticker positions on the return trip.
    educationSpread.hidden = false;
    print.append(printedSkills());
    front.append(print);
    const back = document.createElement('div');
    back.className = 'notebook__turn-back';
    leaf.append(front, back);
    book.querySelector('.notebook__scene').append(leaf);
    turning = true;
    book.dataset.spreadTurn = forward ? 'forward' : 'backward';
    spreads.find(spread => spread.dataset.spread === 'interests').hidden = true;
    syncAccess();
    button.setAttribute('aria-disabled', 'true');
    finishTurn = () => {
      if (!turning) return;
      turning = false;
      showSpread(name);
      delete book.dataset.spreadTurn;
      turnAnimation?.cancel();
      turnAnimation = null;
      leaf.remove();
      finishTurn = null;
      button.setAttribute('aria-disabled', 'false');
      destination.querySelector('[data-notebook-page]').focus({preventScroll: true});
      status.textContent = name === 'interests' ? 'Interests pages. Currently blank.' : 'Education and Skills pages.';
    };
    turnAnimation = leaf.animate([
      {transform: `rotateY(${forward ? 0 : -180}deg)`},
      {transform: `rotateY(${forward ? -180 : 0}deg)`}
    ], {duration: 680, easing: 'cubic-bezier(.32,0,.2,1)', fill: 'forwards'});
    turnAnimation.finished.then(() => finishTurn?.()).catch(() => {});
  }
  bookmarks.forEach(mark => mark.addEventListener('click', () => turnTo(mark.dataset.notebookPage)));
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    if (finishTurn) finishTurn();
    if (['opening', 'closing'].includes(book.dataset.notebookState)) finish();
  });
})();
