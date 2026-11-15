(() => {
  const videos = [...document.querySelectorAll('.lush-motion video')];
  const playTiles = () => videos.forEach(video => video.play().catch(() => {}));
  videos.forEach(video => {
    video.muted = true;
    video.loop = true;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.closest('figure').addEventListener('contextmenu', event => event.preventDefault());
  });
  playTiles();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) playTiles(); });
  document.addEventListener('pointerdown', playTiles, { once: true });

  const carousel = document.querySelector('.crew-carousel');
  if (!carousel) return;
  const stage = carousel.querySelector('.crew-stage');
  const members = [...carousel.querySelectorAll('.crew-member')];
  const count = carousel.querySelector('.crew-count');
  let selected = 0, drag = null, suppressClick = false, wheelTotal = 0, wheelLocked = false, wheelTimer;
  const modulo = n => (n % members.length + members.length) % members.length;
  function select(index) {
    selected = modulo(index);
    members.forEach((member, i) => {
      const offset = modulo(i - selected + 3) - 3;
      member.style.setProperty('--crew-offset', offset);
      member.dataset.position = offset === 0 ? 'front' : Math.abs(offset) === 1 ? 'side' : 'hidden';
      member.setAttribute('aria-pressed', String(offset === 0));
      member.setAttribute('aria-hidden', String(Math.abs(offset) > 1));
      member.tabIndex = Math.abs(offset) <= 1 ? 0 : -1;
    });
    count.textContent = `${selected + 1} / ${members.length}`;
  }
  members.forEach((member, i) => member.addEventListener('click', () => { if (!suppressClick) select(i === selected ? selected + 1 : i); }));
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    drag = { id: event.pointerId, x: event.clientX, delta: 0 };
    suppressClick = false;
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) < 6 && !suppressClick) return;
    suppressClick = true;
    stage.setPointerCapture(event.pointerId);
    carousel.classList.add('is-dragging');
    drag.delta = delta;
    stage.style.setProperty('--crew-drag', `${Math.max(-120, Math.min(120, delta))}px`);
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const delta = drag.delta;
    drag = null;
    carousel.classList.remove('is-dragging');
    stage.style.setProperty('--crew-drag', '0px');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (Math.abs(delta) > 35) select(selected + (delta < 0 ? 1 : -1));
    setTimeout(() => { suppressClick = false; }, 0);
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', event => { if (drag) release(event); });
  stage.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelLocked = false; wheelTotal = 0; }, 160);
    if (wheelLocked) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelTotal += delta * (event.deltaMode === 1 ? 16 : 1);
    if (Math.abs(wheelTotal) >= 35) {
      select(selected + (wheelTotal > 0 ? 1 : -1));
      wheelLocked = true;
      wheelTotal = 0;
    }
  }, { passive: false });
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? members.length - 1 : selected + (event.key === 'ArrowRight' ? 1 : -1));
  });
  carousel.querySelector('[data-crew-prev]').addEventListener('click', () => select(selected - 1));
  carousel.querySelector('[data-crew-next]').addEventListener('click', () => select(selected + 1));
  select(0);
})();
