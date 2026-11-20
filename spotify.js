(() => {
  const rail = document.querySelector('.spotify-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-spotify-chapter]')];
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
    rail.style.setProperty('--spotify-progress', String(progress));
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
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stars = [...document.querySelectorAll('.spotify-star')].map(button => ({
    button, art: button.querySelector('svg'), visible: false, hop: null,
    eyes: [...button.querySelectorAll('[data-star-pupil]')].map(node => ({ node, x: 0, y: 0, targetX: 0, targetY: 0 }))
  }));
  let frame = 0, last = 0;
  function animateEyes(now) {
    frame = 0;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    const ease = 1 - Math.exp(-dt / 70);
    let moving = false;
    stars.forEach(star => star.eyes.forEach(eye => {
      eye.x += (eye.targetX - eye.x) * ease;
      eye.y += (eye.targetY - eye.y) * ease;
      if (Math.hypot(eye.targetX - eye.x, eye.targetY - eye.y) > .015) moving = true;
      else { eye.x = eye.targetX; eye.y = eye.targetY; }
      eye.node.setAttribute('transform', `translate(${eye.x} ${eye.y})`);
    }));
    if (moving) frame = requestAnimationFrame(animateEyes);
    else last = 0;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(animateEyes); }
  function rest() {
    stars.forEach(star => star.eyes.forEach(eye => { eye.targetX = 0; eye.targetY = 0; }));
    schedule();
  }
  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || motion.matches) return;
    stars.forEach(star => {
      if (!star.visible) return;
      const matrix = star.art.getScreenCTM();
      if (!matrix) return;
      const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      star.eyes.forEach(eye => {
        const dx = cursor.x - Number(eye.node.dataset.eyeX);
        const dy = cursor.y - Number(eye.node.dataset.eyeY);
        const distance = Math.hypot(dx, dy);
        const strength = 3.1 * Math.min(distance / 90, 1);
        eye.targetX = distance ? dx / distance * strength : 0;
        eye.targetY = distance ? dy / distance * strength * .7 : 0;
      });
    });
    schedule();
  }, { passive: true });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const star = stars.find(s => s.button === entry.target);
    if (star) { star.visible = entry.isIntersecting; if (!star.visible) { star.eyes.forEach(eye => { eye.targetX = 0; eye.targetY = 0; }); schedule(); } }
    entry.target.classList.toggle('is-awake', entry.isIntersecting && !document.hidden);
  }), { threshold: .1 });
  stars.forEach(star => {
    observer.observe(star.button);
    star.button.addEventListener('click', () => {
      if (motion.matches || star.hop?.playState === 'running') return;
      star.button.classList.add('is-hopping');
      star.hop = star.art.animate([
        { transform: 'translateY(0) rotate(0) scale(1)' },
        { transform: 'translateY(0) rotate(-3deg) scale(1.05,.95)', offset: .16 },
        { transform: 'translateY(-20px) rotate(10deg) scale(1)', offset: .42 },
        { transform: 'translateY(-6px) rotate(-7deg) scale(1)', offset: .68 },
        { transform: 'translateY(0) rotate(2deg) scale(1.04,.97)', offset: .86 },
        { transform: 'translateY(0) rotate(0) scale(1)' }
      ], { duration: 600, easing: 'cubic-bezier(.25,.6,.3,1)' });
      star.hop.finished.catch(() => {}).finally(() => star.button.classList.remove('is-hopping'));
    });
  });
  const sleeve = document.querySelector('.spotify-art');
  if (sleeve) observer.observe(sleeve);
  document.documentElement.addEventListener('pointerleave', rest);
  addEventListener('blur', rest);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.querySelectorAll('.spotify-star, .spotify-art').forEach(node => node.classList.remove('is-awake'));
      rest();
    } else {
      stars.forEach(star => star.button.classList.toggle('is-awake', star.visible));
      if (sleeve) { const rect = sleeve.getBoundingClientRect(); sleeve.classList.toggle('is-awake', rect.bottom > 0 && rect.top < innerHeight); }
    }
  });
  motion.addEventListener('change', () => { if (motion.matches) { stars.forEach(star => star.hop?.cancel()); rest(); } });
})();

(() => {
  const root = document.querySelector('.spotify-music');
  if (!root) return;
  const audio = root.querySelector('audio');
  const play = root.querySelector('.spotify-music__play');
  const replay = root.querySelector('.spotify-music__replay');
  const status = root.querySelector('.spotify-music__status');
  let started = false, seekOnReady = false;
  audio.volume = .3;
  function update() {
    const playing = !audio.paused && !audio.ended;
    root.classList.toggle('is-playing', playing);
    play.setAttribute('aria-label', playing ? 'Pause Swing Lynn' : 'Play Swing Lynn');
    play.setAttribute('aria-pressed', String(playing));
    status.textContent = playing ? 'Playing Swing Lynn.' : 'Music is paused.';
  }
  function seekToStart() {
    seekOnReady = audio.readyState < 1;
    try { audio.currentTime = 2; } catch (_) { seekOnReady = true; }
  }
  function start(restart = false) {
    if (restart || !started || audio.ended) seekToStart();
    started = true;
    // Call play directly from the button gesture, including on mobile Safari.
    audio.play().catch(error => {
      if (error.name === 'AbortError') return;
      update();
      status.textContent = 'Music could not start. Press play to try again.';
    });
  }
  audio.addEventListener('loadedmetadata', () => {
    if (seekOnReady) { audio.currentTime = Math.min(2, Math.max(0, audio.duration - .1)); seekOnReady = false; }
  });
  ['play','playing','pause','ended'].forEach(type => audio.addEventListener(type, update));
  const sleeve = document.querySelector('.spotify-art');
  const stopVinyl = () => sleeve?.classList.remove('is-music-playing');
  audio.addEventListener('playing', () => sleeve?.classList.add('is-music-playing'));
  ['pause','ended','waiting','emptied','error'].forEach(type => audio.addEventListener(type, stopVinyl));
  audio.addEventListener('seeked', () => {
    sleeve?.classList.toggle('is-music-playing', !audio.paused && !audio.ended && audio.readyState >= 3);
  });
  audio.addEventListener('error', () => { update(); status.textContent = 'Music could not load. Press play to try again.'; });
  play.addEventListener('click', () => { if (audio.paused) start(); else audio.pause(); });
  replay.addEventListener('click', () => start(true));
  addEventListener('pagehide', () => audio.pause());
  update();
})();
