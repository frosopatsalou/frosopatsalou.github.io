(() => {
  const rail = document.querySelector('.world-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-world-chapter]')];
  const meter = rail.querySelector('[role=progressbar]');
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
    rail.style.setProperty('--world-progress', String(progress));
    meter.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    document.getElementById(link.hash.slice(1))?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.fonts.ready.then(schedule);
  schedule();
})();

(() => {
  const film = document.getElementById('world-film');
  if (!film) return;
  const buttons = [...document.querySelectorAll('[data-film-time]')];
  let requestedTime = null;
  const seek = () => {
    if (requestedTime === null || film.readyState < 1) return;
    film.currentTime = requestedTime;
    requestedTime = null;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    requestedTime = Number(button.dataset.filmTime);
    if (film.readyState < 1) film.load();
    else seek();
  }));
  film.addEventListener('loadedmetadata', seek);
  film.addEventListener('timeupdate', () => {
    const time = film.currentTime;
    let active = buttons[0];
    buttons.forEach(button => { if (Number(button.dataset.filmTime) <= time + .15) active = button; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button === active)));
  });
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && !film.paused) film.pause();
  }).observe(film);
  document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); });
})();
