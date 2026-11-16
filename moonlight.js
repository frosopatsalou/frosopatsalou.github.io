(() => {
  const index = document.querySelector('.moon-index');
  if (!index) return;
  const links = [...index.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-moon-chapter]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, active = -1;
  function update() {
    frame = 0;
    const marker = index.getBoundingClientRect().bottom + 50;
    let current = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= marker) current = i; });
    if (current !== active) {
      active = current;
      links.forEach((link, i) => {
        if (i === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      if (index.scrollWidth > index.clientWidth) index.scrollTo({ left: links[current].offsetLeft - index.clientWidth / 2 + links[current].offsetWidth / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    const start = sections[0].getBoundingClientRect().top + scrollY;
    const end = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(0, Math.min(1, (scrollY - start + 180) / Math.max(1, end - start + 180)));
    index.style.setProperty('--moon-progress', String(progress));
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
