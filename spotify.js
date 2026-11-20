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
  const tracks = [
    { title: 'Swing Lynn', artist: 'Harmless', src: './assets/spotify/swing-lynn-instrumental.mp3', start: 3 },
    { title: 'Saturn', artist: 'SZA', src: './assets/spotify/saturn-instrumental.mp3', start: 0 },
    { title: 'Tokyo Reggie', artist: 'Masayoshi Takanaka', src: './assets/spotify/tokyo-reggie-instrumental.mp3', start: 0 }
  ];
  const audio = root.querySelector('audio');
  const play = root.querySelector('.spotify-music__play');
  const previous = root.querySelector('.spotify-music__previous');
  const next = root.querySelector('.spotify-music__next');
  const title = root.querySelector('.spotify-music__label strong');
  const artist = root.querySelector('.spotify-music__label > span');
  const seek = root.querySelector('.spotify-music__seek');
  const elapsed = root.querySelector('.spotify-music__elapsed');
  const duration = root.querySelector('.spotify-music__duration');
  const status = root.querySelector('.spotify-music__status');
  const sleeve = document.querySelector('.spotify-art');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const label = root.querySelector('.spotify-music__label');
  const timeline = root.querySelector('.spotify-music__timeline');
  const effects = new WeakMap();
  let index = 0, pendingSeek = tracks[0].start;
  let feedbackUntil = 0, visibilityTimer = 0, scrollFrame = 0;
  let lastScroll = Math.max(0, scrollY), scrollDirection = 0, scrollTravel = 0;
  let scrollRevealed = lastScroll <= 96;
  function syncVisibility() {
    const hide = scrollY > 96 && !scrollRevealed && (audio.paused || audio.ended) &&
      performance.now() >= feedbackUntil && !root.querySelector(':focus-visible');
    root.classList.toggle('is-hidden', hide);
    root.inert = hide;
    if (hide) root.setAttribute('aria-hidden', 'true');
    else root.removeAttribute('aria-hidden');
  }
  function animate(node, frames, duration = 260) {
    effects.get(node)?.cancel();
    if (motion.matches) return;
    const effect = node.animate(frames, { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
    effects.set(node, effect);
  }
  function feedback(button, direction = 0) {
    feedbackUntil = performance.now() + (motion.matches ? 0 : 360);
    clearTimeout(visibilityTimer);
    syncVisibility();
    visibilityTimer = setTimeout(syncVisibility, motion.matches ? 0 : 380);
    animate(button, [
      { transform: 'translateX(0) rotate(0) scale(1)' },
      { transform: `translateX(${direction * 4}px) rotate(${direction ? direction * 9 : -8}deg) scale(.84)`, offset: .3 },
      { transform: `translateX(${-direction}px) rotate(2deg) scale(1.07)`, offset: .7 },
      { transform: 'translateX(0) rotate(0) scale(1)' }
    ], 300);
  }
  function scrollVisibility() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const y = Math.max(0, scrollY);
      const delta = y - lastScroll;
      lastScroll = y;
      if (y > 24) root.classList.add('has-scrolled');
      if (y <= 96) {
        scrollRevealed = true;
        scrollTravel = 0;
      } else if (delta !== 0) {
        const direction = Math.sign(delta);
        if (direction !== scrollDirection) { scrollDirection = direction; scrollTravel = 0; }
        scrollTravel += Math.abs(delta);
        if (scrollTravel >= 12) {
          scrollRevealed = direction < 0;
          scrollTravel = 0;
        }
      }
      syncVisibility();
    });
  }
  addEventListener('scroll', scrollVisibility, { passive: true });
  root.addEventListener('focusin', syncVisibility);
  root.addEventListener('focusout', () => setTimeout(syncVisibility, 0));
  motion.addEventListener('change', () => {
    [play, previous, next, label, timeline].forEach(node => effects.get(node)?.cancel());
    feedbackUntil = 0; syncVisibility();
  });
  audio.volume = .3;
  const format = seconds => {
    const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  const interacted = () => root.classList.add('has-interacted');
  const stopVinyl = () => sleeve?.classList.remove('is-music-playing');
  function updateProgress() {
    const length = Number.isFinite(audio.duration) ? audio.duration : 0;
    const time = pendingSeek ?? audio.currentTime;
    elapsed.textContent = format(time);
    duration.textContent = format(length);
    seek.disabled = length <= 0;
    seek.max = String(length);
    seek.value = String(Math.min(time, length));
    seek.style.setProperty('--song-progress', `${length ? time / length * 100 : 0}%`);
    seek.setAttribute('aria-valuetext', `${format(time)} of ${format(length)}`);
    previous.setAttribute('aria-label', audio.currentTime > tracks[index].start + 3
      ? `Restart ${tracks[index].title}`
      : `Previous song, ${tracks[(index + tracks.length - 1) % tracks.length].title}`);
  }
  function update() {
    const playing = !audio.paused && !audio.ended;
    root.classList.toggle('is-playing', playing);
    play.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${tracks[index].title}`);
    play.setAttribute('aria-pressed', String(playing));
    next.setAttribute('aria-label', `Next song, ${tracks[(index + 1) % tracks.length].title}`);
    status.textContent = `${tracks[index].title} by ${tracks[index].artist}. ${playing ? 'Playing.' : 'Paused.'}`;
    updateProgress();
    syncVisibility();
  }
  function applySeek() {
    if (pendingSeek === null || audio.readyState < 1) return;
    audio.currentTime = Math.min(pendingSeek, Math.max(0, audio.duration - .1));
    pendingSeek = null;
  }
  function start() {
    applySeek();
    audio.play().catch(error => {
      if (error.name === 'AbortError') return;
      update(); status.textContent = 'Music could not start. Press play to try again.';
    });
  }
  function selectTrack(value, autoplay) {
    audio.pause();
    index = (value + tracks.length) % tracks.length;
    const track = tracks[index];
    pendingSeek = track.start;
    title.textContent = track.title; artist.textContent = track.artist;
    audio.src = track.src; audio.load();
    update();
    if (autoplay) start();
  }
  audio.addEventListener('loadedmetadata', () => { applySeek(); update(); });
  audio.addEventListener('durationchange', updateProgress);
  audio.addEventListener('timeupdate', updateProgress);
  ['play','playing','pause'].forEach(type => audio.addEventListener(type, update));
  audio.addEventListener('playing', () => sleeve?.classList.add('is-music-playing'));
  ['pause','ended','waiting','emptied','error'].forEach(type => audio.addEventListener(type, stopVinyl));
  audio.addEventListener('seeked', () => {
    sleeve?.classList.toggle('is-music-playing', !audio.paused && !audio.ended && audio.readyState >= 3);
    updateProgress();
  });
  audio.addEventListener('ended', () => {
    if (index < tracks.length - 1) selectTrack(index + 1, true);
    else update();
  });
  audio.addEventListener('error', () => { update(); status.textContent = 'Music could not load. Press play to try again.'; });
  play.addEventListener('click', () => {
    interacted(); feedback(play);
    if (audio.paused) { if (audio.ended) pendingSeek = tracks[index].start; start(); }
    else audio.pause();
  });
  next.addEventListener('click', () => {
    interacted(); feedback(next, 1);
    selectTrack(index + 1, !audio.paused);
    animate(label, [{ opacity: 0, transform: 'translateX(12px)' }, { opacity: 1, transform: 'translateX(0)' }]);
  });
  previous.addEventListener('click', () => {
    interacted(); feedback(previous, -1);
    if (audio.currentTime > tracks[index].start + 3) {
      pendingSeek = tracks[index].start; applySeek(); updateProgress();
      animate(timeline, [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)', offset: .35 }, { transform: 'translateX(1px)', offset: .7 }, { transform: 'translateX(0)' }]);
    } else {
      selectTrack(index - 1, !audio.paused);
      animate(label, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'translateX(0)' }]);
    }
  });
  seek.addEventListener('input', () => {
    interacted(); pendingSeek = null;
    audio.currentTime = Number(seek.value);
    updateProgress();
  });
  addEventListener('pagehide', () => audio.pause());
  scrollVisibility();
  update();
})();
