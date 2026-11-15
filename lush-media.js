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

  const mascot = document.querySelector('.lush-hero-mascot');
  if (mascot) {
    const art = mascot.querySelector('.lush-mascot-art');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const eyes = [...art.querySelectorAll('[data-mascot-pupil]')].map(node => ({
      node, x: 0, y: 0, targetX: 0, targetY: 0,
      baseX: Number(node.dataset.baseX), baseY: Number(node.dataset.baseY)
    }));
    let eyeFrame = 0;
    const animateEyes = () => {
      eyeFrame = 0;
      let moving = false;
      eyes.forEach(eye => {
        eye.x += (eye.targetX - eye.x) * .22;
        eye.y += (eye.targetY - eye.y) * .22;
        if (Math.hypot(eye.targetX - eye.x, eye.targetY - eye.y) > .025) moving = true;
        eye.node.setAttribute('transform', `translate(${eye.baseX + eye.x} ${eye.baseY + eye.y})`);
      });
      if (moving) eyeFrame = requestAnimationFrame(animateEyes);
    };
    const scheduleEyes = () => { if (!eyeFrame) eyeFrame = requestAnimationFrame(animateEyes); };
    const restEyes = () => {
      eyes.forEach(eye => { eye.targetX = 0; eye.targetY = 0; });
      scheduleEyes();
    };
    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reducedMotion.matches || !mascot.classList.contains('is-awake')) return;
      const matrix = art.getScreenCTM();
      if (!matrix) return;
      const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      eyes.forEach(eye => {
        const dx = cursor.x - Number(eye.node.dataset.eyeX);
        const dy = cursor.y - Number(eye.node.dataset.eyeY);
        const distance = Math.hypot(dx, dy);
        const strength = 12 * Math.min(distance / 160, 1);
        eye.targetX = distance ? dx / distance * strength : 0;
        eye.targetY = distance ? dy / distance * strength : 0;
      });
      scheduleEyes();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', restEyes);
    window.addEventListener('blur', restEyes);
    let hop;
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        mascot.classList.toggle('is-awake', entry.isIntersecting);
        if (!entry.isIntersecting) restEyes();
      });
    }, { threshold: .1 }).observe(mascot);
    mascot.addEventListener('click', () => {
      if (reducedMotion.matches || hop?.playState === 'running') return;
      mascot.classList.add('is-hopping');
      hop = art.animate([
        { transform: 'translateY(0) rotate(0) scale(1)', offset: 0 },
        { transform: 'translateY(0) rotate(0) scale(1.12,.87)', offset: .14 },
        { transform: 'translateY(-23px) rotate(-8deg) scale(.96,1.05)', offset: .4 },
        { transform: 'translateY(-11px) rotate(6deg) scale(1)', offset: .63 },
        { transform: 'translateY(0) rotate(-2deg) scale(1.1,.9)', offset: .8 },
        { transform: 'translateY(0) rotate(0) scale(1)', offset: 1 }
      ], { duration: 640, easing: 'cubic-bezier(.25,.6,.3,1)' });
      hop.finished.then(() => mascot.classList.remove('is-hopping')).catch(() => mascot.classList.remove('is-hopping'));
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) { hop?.cancel(); restEyes(); }
    });
  }

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
