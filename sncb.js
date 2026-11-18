(() => {
  const rail = document.querySelector('.sncb-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-sncb-chapter]')];
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
    rail.style.setProperty('--sncb-progress', String(progress));
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
  const video = document.querySelector('.sncb-motion-board video');
  const button = document.querySelector('.sncb-motion-toggle');
  if (!video || !button) return;
  button.removeAttribute('aria-pressed');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = reduced.matches;
  let visible = false;
  function sync() {
    if (visible && !manuallyPaused && !document.hidden) video.play().catch(() => {});
    else video.pause();
    button.textContent = manuallyPaused ? 'Play motion' : 'Pause motion';
  }
  button.addEventListener('click', () => { manuallyPaused = !manuallyPaused; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .1 }).observe(video);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { manuallyPaused = reduced.matches; sync(); });
  sync();
})();
