(() => {
  const index = document.querySelector('.moon-index');
  if (!index) return;
  const links = [...index.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-moon-chapter]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, active = -1;
  function update() {
    frame = 0;
    const marker = 190;
    let current = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= marker) current = i; });
    if (current !== active) {
      active = current;
      links.forEach((link, i) => {
        if (i === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
        link.classList.toggle('is-read', i < current);
      });
    }
    const start = sections[0].getBoundingClientRect().top + scrollY;
    const end = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, (scrollY - start + 180) / Math.max(1, end - start + 180)));
    index.style.setProperty('--moon-progress', String(progress));
    index.querySelector('[role=progressbar]').setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const section = document.getElementById(link.hash.slice(1));
    history.replaceState(null, '', link.hash);
    section?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.fonts.ready.then(schedule);
  schedule();
})();

// Animate native details without duplicating or swapping their content.
(() => {
  const cards = [...document.querySelectorAll('.moon-structure details')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();
  let request = 0;
  const steps = document.querySelector('.moon-structure__steps');
  let reservedWidth = 0;
  function reserveSpace() {
    const width = steps.clientWidth;
    if (width === reservedWidth) return;
    reservedWidth = width;
    const gap = parseFloat(getComputedStyle(steps).rowGap) || 0;
    let headings = 0, largestBody = 0;
    cards.forEach(card => {
      const open = card.open;
      card.open = true;
      const heading = card.querySelector('summary').getBoundingClientRect().height + 2;
      const body = card.querySelector('summary').nextElementSibling.getBoundingClientRect().height;
      headings += heading;
      largestBody = Math.max(largestBody, body);
      card.open = open;
    });
    steps.style.minHeight = `${Math.ceil(headings + largestBody + gap * (cards.length - 1))}px`;
  }
  document.fonts.ready.then(() => { reservedWidth = 0; reserveSpace(); });
  new ResizeObserver(reserveSpace).observe(steps);
  reserveSpace();
  async function setExpanded(card, expanded) {
    const start = card.getBoundingClientRect().height;
    const previous = animations.get(card);
    previous?.cancel();
    card.style.height = '';
    card.open = true;
    const end = expanded ? card.getBoundingClientRect().height : card.querySelector('summary').getBoundingClientRect().height + 2;
    card.querySelector('summary').setAttribute('aria-expanded', String(expanded));
    card.querySelector('summary').nextElementSibling.inert = !expanded;
    if (reduced.matches) { card.open = expanded; return; }
    const animation = card.animate([{height: `${start}px`}, {height: `${end}px`}], {duration: expanded ? 460 : 360, easing: 'cubic-bezier(.4,0,.2,1)'});
    animations.set(card, animation);
    try { await animation.finished; } catch { return; }
    if (animations.get(card) !== animation) return;
    card.open = expanded;
    animations.delete(card);
  }
  cards.forEach(card => {
    const summary = card.querySelector('summary');
    summary.setAttribute('aria-expanded', String(card.open));
    summary.addEventListener('click', async event => {
      event.preventDefault();
      const token = ++request;
      const expanded = summary.getAttribute('aria-expanded') !== 'true';
      if (!expanded) { await setExpanded(card, false); return; }
      await Promise.all(cards.filter(other => other !== card && other.open).map(other => setExpanded(other, false)));
      if (token === request) await setExpanded(card, true);
    });
  });
})();
