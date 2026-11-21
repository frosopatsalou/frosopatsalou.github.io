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
  const controls = document.querySelector('.world-player');
  const toggle = document.querySelector('[data-film-toggle]');
  const label = document.querySelector('[data-film-toggle-label]');
  const progress = document.getElementById('world-film-progress');
  const clock = document.querySelector('[data-film-clock]');
  const status = document.querySelector('[data-film-status]');
  let requestedTime = null;
  const formatTime = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  function sync() {
    const duration = Number.isFinite(film.duration) ? film.duration : 49;
    const time = film.currentTime;
    const playing = !film.paused && !film.ended;
    const action = playing ? 'Pause' : film.ended ? 'Replay' : 'Play';
    toggle.setAttribute('aria-label', `${action} film`);
    label.textContent = action;
    toggle.querySelector('[data-play-symbol]').toggleAttribute('hidden', playing);
    toggle.querySelector('[data-pause-symbol]').toggleAttribute('hidden', !playing);
    controls.classList.toggle('is-playing', playing);
    progress.max = String(duration);
    progress.value = String(time);
    progress.style.setProperty('--played', `${time / duration * 100}%`);
    progress.setAttribute('aria-valuetext', `${Math.floor(time)} seconds of ${Math.round(duration)} seconds`);
    clock.replaceChildren(document.createTextNode(`${formatTime(time)} `));
    const total = document.createElement('span');
    total.textContent = `/ ${formatTime(duration)}`;
    clock.append(total);
    let active = buttons[0];
    buttons.forEach(button => { if (Number(button.dataset.filmTime) <= time + .15) active = button; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button === active)));
  }
  function seek() {
    if (requestedTime === null || film.readyState < 1) return;
    film.currentTime = requestedTime;
    requestedTime = null;
    sync();
  }
  function requestSeek(time) {
    requestedTime = time;
    if (film.readyState < 1) {
      if (film.networkState !== HTMLMediaElement.NETWORK_LOADING) film.load();
    } else seek();
  }
  async function play() {
    try {
      status.hidden = true;
      await film.play();
    } catch (error) {
      if (error.name === 'AbortError') return;
      status.textContent = 'The film could not play. Please try again, or explore the live world below.';
      status.hidden = false;
      sync();
    }
  }
  toggle.addEventListener('click', () => {
    if (!film.paused) film.pause();
    else { if (film.ended) film.currentTime = 0; play(); }
  });
  document.querySelector('[data-film-restart]').addEventListener('click', () => { requestSeek(0); play(); });
  progress.addEventListener('input', () => { requestSeek(Number(progress.value)); });
  buttons.forEach(button => button.addEventListener('click', () => requestSeek(Number(button.dataset.filmTime))));
  film.addEventListener('loadedmetadata', () => { seek(); sync(); });
  ['timeupdate', 'play', 'pause', 'ended', 'seeked'].forEach(event => film.addEventListener(event, sync));
  film.addEventListener('waiting', () => { if (!film.paused) label.textContent = 'Loading'; });
  film.addEventListener('playing', sync);
  film.addEventListener('error', () => {
    status.textContent = 'The film could not load. You can explore the live world below.';
    status.hidden = false;
  });
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && !film.paused) film.pause();
  }).observe(film);
  document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); });
  film.controls = false;
  controls.hidden = false;
  sync();
})();
