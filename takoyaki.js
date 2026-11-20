(() => {
  const rail = document.querySelector('.cart-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-cart-chapter]')];
  const meter = rail.querySelector('[role=progressbar]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function update() {
    frame = 0;
    const end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let active = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= 190) active = i; });
    if (scrollY >= end - 3) active = sections.length - 1;
    links.forEach((link, i) => {
      if (i === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-read', i < active);
    });
    const start = sections[0].getBoundingClientRect().top + scrollY;
    const progress = Math.max(0, Math.min(1, (scrollY - start + 180) / Math.max(1, end - start + 180)));
    rail.style.setProperty('--cart-progress', String(progress));
    meter.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    document.getElementById(link.hash.slice(1))?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.fonts.ready.then(schedule);
  schedule();
})();

(() => {
  const buttons = [...document.querySelectorAll('[data-cart-view]')];
  const stage = document.querySelector('.cart-model__stage');
  if (!stage) return;
  const caption = document.querySelector('[data-cart-caption]');
  const preview = document.querySelector('[data-cart-model-preview]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const view = button.dataset.cartView;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    stage.querySelectorAll('img').forEach(img => { img.hidden = img.dataset.cartImage !== view; });
    caption.textContent = view === 'solid' ? 'Solid view of the final scene' : 'Final textured render';
    preview.href = `./assets/takoyaki/${view === 'solid' ? 'solid' : 'hero'}.png`;
    animation?.cancel();
    if (!reduced.matches) animation = stage.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  }));
  reduced.addEventListener('change', () => { if (reduced.matches) animation?.cancel(); });
})();
