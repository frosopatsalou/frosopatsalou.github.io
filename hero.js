(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const names = [...document.querySelectorAll('.hero-name:not(.hero-role)')];
  const role = document.querySelector('.hero-role');
  const face = document.querySelector('.hero-face');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('primary-navigation');
  const toggle = header.querySelector('.nav-toggle');
  const measure = nav.cloneNode(true);
  measure.removeAttribute('id');
  measure.setAttribute('aria-hidden', 'true');
  measure.classList.add('nav-measure');
  measure.inert = true;
  document.body.append(measure);
  function setMenu(open, focusToggle = false) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.hidden = header.classList.contains('is-compact') && !open;
    if (focusToggle) toggle.focus();
  }
  function fitNavigation() {
    const gap = parseFloat(getComputedStyle(header).columnGap) || 0;
    const required = header.querySelector('.site-logo').getBoundingClientRect().width + measure.getBoundingClientRect().width + gap;
    const compact = required > header.clientWidth;
    if (compact !== header.classList.contains('is-compact')) {
      header.classList.toggle('is-compact', compact);
      setMenu(false);
    }
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target) && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  }, { capture: true });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (link && !link.hasAttribute('aria-disabled')) setMenu(false);
  });
  new ResizeObserver(fitNavigation).observe(header);
  document.fonts.ready.then(fitNavigation);
  fitNavigation();
  const timers = [];
  let started = false;
  const reveal = element => {
    if (!element.classList.contains('is-entering')) element.classList.add('is-entering');
  };
  function finish() {
    timers.forEach(clearTimeout);
    [header, ...names, role, face].forEach(reveal);
    header.inert = false;
    const desk = document.querySelector('.desk');
    if (desk.dataset.entrance !== 'complete') {
      desk.dataset.entrance = 'complete';
      document.dispatchEvent(new Event('portfolio:entrance-complete'));
    }
  }
  document.addEventListener('portfolio:intro-complete', () => {
    if (started) return;
    started = true;
    if (motion.matches) { finish(); return; }
    reveal(header);
    header.inert = false;
    names.forEach((name, index) => timers.push(setTimeout(() => reveal(name), 220 + index * 60)));
    timers.push(setTimeout(() => reveal(role), 420));
    timers.push(setTimeout(() => reveal(face), 620));
    timers.push(setTimeout(finish, 900));
  }, { once: true });
  motion.addEventListener('change', event => { if (event.matches && started) finish(); });
  // Destinations will be enabled as their content is built.
  header.addEventListener('click', event => {
    if (event.target.closest('[aria-disabled="true"]')) event.preventDefault();
  });
})();
