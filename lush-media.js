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
  const focusImage = carousel.querySelector('.crew-focus img');
  const caption = carousel.querySelector('.crew-focus figcaption');
  const count = carousel.querySelector('.crew-count');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const step = 360 / members.length;
  let rotation = 0, selected = 0, drag = null, suppressClick = false;
  const modulo = n => (n % members.length + members.length) % members.length;
  members.forEach((member, index) => {
    const angle = index * 2 * Math.PI / members.length;
    member.style.left = `${50 + Math.sin(angle) * 40}%`;
    member.style.top = `${50 - Math.cos(angle) * 40}%`;
    member.addEventListener('click', () => { if (!suppressClick) select(index); });
  });
  function show(index) {
    if (index === selected) return;
    selected = index;
    const member = members[index];
    focusImage.src = member.querySelector('img').src;
    focusImage.alt = `${member.dataset.crewName}, an original Lush Scrubby character`;
    caption.textContent = member.dataset.crewName;
    count.textContent = `${index + 1} / ${members.length}`;
    members.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    if (!reducedMotion.matches) {
      focusImage.getAnimations().forEach(animation => animation.cancel());
      focusImage.animate([{ opacity: .35, transform: 'scale(.8) rotate(-7deg)' }, { opacity: 1, transform: 'scale(1.06) rotate(3deg)', offset: .7 }, { opacity: 1, transform: 'scale(1) rotate(0)' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  function paint() { carousel.style.setProperty('--crew-angle', `${rotation}deg`); }
  function select(index) {
    index = modulo(index);
    const delta = ((-index * step - rotation) % 360 + 540) % 360 - 180;
    rotation += delta;
    show(index);
    paint();
  }
  const angleAt = event => {
    const rect = stage.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  };
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    drag = { id: event.pointerId, lastAngle: angleAt(event), moved: 0, x: event.clientX, y: event.clientY };
    suppressClick = false;
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6 && !drag.moved) return;
    if (!drag.moved) {
      stage.setPointerCapture(event.pointerId);
      carousel.classList.add('is-spinning');
    }
    const angle = angleAt(event);
    const delta = ((angle - drag.lastAngle) % 360 + 540) % 360 - 180;
    rotation += delta;
    drag.lastAngle = angle;
    drag.moved += Math.abs(delta);
    suppressClick = true;
    paint();
    show(modulo(Math.round(-rotation / step)));
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    carousel.classList.remove('is-spinning');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (moved) {
      rotation = Math.round(rotation / step) * step;
      show(modulo(Math.round(-rotation / step)));
      paint();
    }
    setTimeout(() => { suppressClick = false; }, 0);
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', event => { if (drag) release(event); });
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? members.length - 1 : selected + (event.key === 'ArrowRight' ? 1 : -1));
  });
  carousel.querySelector('[data-crew-prev]').addEventListener('click', () => select(selected - 1));
  carousel.querySelector('[data-crew-next]').addEventListener('click', () => select(selected + 1));
})();
