(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const names = [...document.querySelectorAll('.hero-name:not(.hero-role)')];
  const role = document.querySelector('.hero-role');
  const face = document.querySelector('.hero-face');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
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
