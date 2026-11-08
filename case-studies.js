(() => {
  const board = document.querySelector('.case-board__grid');
  if (!board) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const instructions = document.createElement('p');
  instructions.id = 'case-card-instructions';
  instructions.className = 'sr-only';
  instructions.textContent = 'Pull down to unpin this card. With a keyboard, press Enter, Space or Arrow Down to let it fall. Use Bring back to pin it up again.';
  board.before(instructions);
  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  board.after(status);

  board.querySelectorAll('.case-card').forEach((card, index) => {
    const title = card.querySelector('h3').textContent;
    const slot = document.createElement('div');
    slot.className = 'case-slot';
    slot.style.setProperty('--card-tilt', `${index % 2 ? 3 : -3}deg`);
    card.before(slot);
    slot.append(card);
    // The pin stays on the board while the paper underneath moves.
    slot.append(card.querySelector('.case-card__pin'));
    const restore = document.createElement('button');
    restore.type = 'button';
    restore.className = 'button case-card__restore';
    restore.textContent = 'Bring back';
    restore.setAttribute('aria-label', `Bring back ${title}`);
    restore.hidden = true;
    slot.append(restore);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Pull down ${title} card`);
    card.setAttribute('aria-describedby', instructions.id);
    card.querySelectorAll('img').forEach(image => { image.draggable = false; });
    let state = 'pinned';
    let pull = null;

    const releaseCapture = () => {
      if (!pull) return;
      const id = pull.id;
      pull = null;
      if (card.hasPointerCapture(id)) card.releasePointerCapture(id);
    };
    const settle = () => {
      if (state !== 'pulling') return;
      releaseCapture();
      state = 'pinned';
      slot.classList.remove('is-pulling');
      card.style.removeProperty('transform');
    };
    const fall = (x = 0, y = 0, angle = 0) => {
      const hadFocus = document.activeElement === card;
      releaseCapture();
      state = 'falling';
      slot.classList.remove('is-pulling');
      slot.classList.add('is-falling');
      card.tabIndex = -1;
      card.style.removeProperty('transform');
      const distance = Math.min(380, Math.max(220, slot.offsetHeight * 1.05));
      const direction = index % 2 ? 1 : -1;
      const pose = (dx, dy, a) => `translate(${dx}px, ${dy}px) rotate(${a}deg)`;
      const animation = card.animate(reducedMotion.matches ? [{opacity: 1}, {opacity: 0}] : [
        {transform: pose(x, y, angle), opacity: 1, offset: 0},
        {transform: pose(x + direction * 18, y + distance * .28, angle + direction * 8), opacity: 1, offset: .4},
        {transform: pose(x - direction * 12, y + distance, angle + direction * 17), opacity: 0, offset: 1}
      ], {duration: reducedMotion.matches ? 100 : 1150, easing: 'cubic-bezier(.32,.05,.68,.7)', fill: 'forwards'});
      animation.finished.then(() => {
        card.style.visibility = 'hidden';
        card.setAttribute('aria-hidden', 'true');
        animation.cancel();
        slot.classList.remove('is-falling');
        slot.classList.add('is-empty');
        state = 'empty';
        restore.hidden = false;
        status.textContent = `${title} unpinned. Bring it back whenever you like.`;
        if (hadFocus) restore.focus({preventScroll: true});
      });
    };

    card.addEventListener('pointerdown', event => {
      if (state !== 'pinned' || !event.isPrimary || event.button !== 0) return;
      state = 'pulling';
      pull = {id: event.pointerId, x: event.clientX, y: event.clientY};
      slot.classList.add('is-pulling');
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener('pointermove', event => {
      if (state !== 'pulling' || event.pointerId !== pull?.id) return;
      const dy = Math.max(0, event.clientY - pull.y);
      const dx = Math.max(-35, Math.min(35, (event.clientX - pull.x) * .3));
      const angle = dx * .16;
      card.style.transform = `translate(${dx}px, ${dy * .65}px) rotate(${angle}deg)`;
      if (dy >= 52) fall(dx, dy * .65, angle);
    });
    card.addEventListener('pointerup', settle);
    card.addEventListener('pointercancel', settle);
    card.addEventListener('lostpointercapture', settle);
    card.addEventListener('dragstart', event => event.preventDefault());
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape') { settle(); return; }
      if (state !== 'pinned' || !['Enter', ' ', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      fall();
    });
    window.addEventListener('blur', settle);
    restore.addEventListener('click', () => {
      if (state !== 'empty') return;
      state = 'returning';
      restore.hidden = true;
      slot.classList.remove('is-empty');
      slot.classList.add('is-returning');
      card.style.removeProperty('visibility');
      card.removeAttribute('aria-hidden');
      const animation = card.animate([{opacity: 0}, {opacity: 1}], {
        duration: reducedMotion.matches ? 100 : 300, easing: 'ease-out', fill: 'forwards'
      });
      animation.finished.then(() => {
        animation.cancel();
        state = 'pinned';
        card.tabIndex = 0;
        slot.classList.remove('is-returning');
        card.focus({preventScroll: true});
        status.textContent = `${title} pinned back on the board.`;
      });
    });
  });
})();
