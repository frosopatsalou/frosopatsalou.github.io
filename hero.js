(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const name = document.querySelector('.hero-name');
  const face = document.querySelector('.hero-face');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = [];
  let started = false;
  const reveal = element => {
    if (!element.classList.contains('is-entering')) element.classList.add('is-entering');
  };
  function finish() {
    timers.forEach(clearTimeout);
    [header, name, face].forEach(reveal);
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
    timers.push(setTimeout(() => reveal(name), 220));
    timers.push(setTimeout(() => reveal(face), 540));
    timers.push(setTimeout(finish, 800));
  }, { once: true });
  motion.addEventListener('change', event => { if (event.matches && started) finish(); });
  // Destinations will be enabled as their content is built.
  header.addEventListener('click', event => {
    if (event.target.closest('[aria-disabled="true"]')) event.preventDefault();
  });
})();
