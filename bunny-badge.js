(() => {
  const hanger = document.querySelector('.bunny-hanger');
  if (!hanger) return;
  const anchor = hanger.closest('.about__badge-wrap');
  const card = hanger.querySelector('.bunny-card');
  const payload = hanger.querySelector('.bunny-payload');
  const strap = hanger.querySelector('.bunny-strap');
  let stretch = 0, stretchVelocity = 0, strapLength = 207, maxPull = 180;
  new ResizeObserver(() => {
    strapLength = Math.max(30, anchor.getBoundingClientRect().width * 207 / 423);
    maxPull = Math.min(180, anchor.getBoundingClientRect().width * .5);
    draw();
  }).observe(anchor);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const limit = .48;
  let angle = 0, velocity = 0, frame = 0, last = 0, pointer = null;
  let entry = null, visible = true, started = false;
  const clamp = (value, max) => Math.max(-max, Math.min(max, value));
  function draw() {
    hanger.style.transform = `rotate(${angle}rad)`;
    hanger.dataset.swingAngle = angle.toFixed(4);
    payload.style.transform = `translateY(${stretch}px)`;
    strap.style.transform = `scaleY(${Math.max(.4, 1 + stretch / strapLength)})`;
    hanger.dataset.stretch = stretch.toFixed(2);
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (hanger.classList.contains('is-swinging')) hanger.classList.remove('is-swinging');
  }
  function rest() { stop(); angle = 0; velocity = 0; stretch = 0; stretchVelocity = 0; draw(); }
  function tick(now) {
    frame = 0;
    if (pointer || !visible || document.hidden || motion.matches) { stop(); return; }
    const elapsed = Math.min((now - (last || now - 16)) / 1000, 5);
    last = now;
    // Solve the damped spring from elapsed time rather than counting frames.
    // Motion stays at the same pace when a browser throttles rendering.
    const damping = 1.7, frequency = Math.sqrt(22 - damping * damping);
    const decay = Math.exp(-damping * elapsed);
    const cosine = Math.cos(frequency * elapsed), sine = Math.sin(frequency * elapsed);
    const nextAngle = decay * (angle * cosine + (velocity + damping * angle) / frequency * sine);
    velocity = decay * (velocity * cosine - (damping * velocity + 22 * angle) / frequency * sine);
    angle = clamp(nextAngle, limit);
    const radialDamping = 2.7, radialFrequency = Math.sqrt(85 - radialDamping * radialDamping);
    const radialDecay = Math.exp(-radialDamping * elapsed);
    const radialCosine = Math.cos(radialFrequency * elapsed), radialSine = Math.sin(radialFrequency * elapsed);
    const nextStretch = radialDecay * (stretch * radialCosine + (stretchVelocity + radialDamping * stretch) / radialFrequency * radialSine);
    stretchVelocity = radialDecay * (stretchVelocity * radialCosine - (radialDamping * stretchVelocity + 85 * stretch) / radialFrequency * radialSine);
    stretch = Math.max(-Math.min(65, strapLength * .5), Math.min(maxPull, nextStretch));
    draw();
    if (Math.abs(stretch) < .15 && Math.abs(stretchVelocity) < .5 && Math.abs(angle) < .001 && Math.abs(velocity) < .004) { rest(); return; }
    frame = requestAnimationFrame(tick);
  }
  function swing(impulse = 0) {
    if (motion.matches || !visible || document.hidden) { rest(); return; }
    velocity = clamp(velocity + impulse, 3);
    hanger.classList.add('is-swinging');
    if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
  }
  function finishEntry() {
    if (entry) { entry.cancel(); entry = null; }
    hanger.dataset.bunnyReady = 'true';
  }
  function enter() {
    if (started) return;
    started = true;
    hanger.dataset.bunnyReady = 'true';
    if (motion.matches) { rest(); return; }
    hanger.dataset.bunnyState = 'dropping';
    entry = hanger.animate([
      { translate: '0 -110%', opacity: 0 },
      { translate: '0 10px', opacity: 1, offset: .8 },
      { translate: '0 0', opacity: 1 }
    ], { duration: 760, easing: 'cubic-bezier(.25,.15,.4,1)' });
    entry.finished.then(() => {
      entry = null;
      hanger.dataset.bunnyState = 'ready';
      angle = 0; draw(); swing(1.7);
    }).catch(() => {});
  }
  document.addEventListener('portfolio:entrance-complete', enter, { once: true });
  function pointerAngle(event) {
    const bounds = anchor.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width * .591);
    const y = Math.max(30, event.clientY - bounds.top);
    return -Math.atan2(x, y);
  }
  card.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || pointer) return;
    event.preventDefault();
    finishEntry(); stop();
    const softLimit = maxPull * .65, remaining = maxPull - softLimit;
    const rawStretch = stretch > softLimit ? softLimit - remaining * Math.log(Math.max(.001, 1 - (stretch - softLimit) / remaining)) : stretch < 0 ? stretch / .4 : stretch;
    pointer = { id: event.pointerId, offset: angle - pointerAngle(event), angle, time: performance.now(), moved: false, startY: event.clientY, rawStretch, stretch };
    stretchVelocity = 0;
    velocity = 0;
    card.classList.add('is-tugging');
    hanger.dataset.bunnyState = 'tugging';
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const next = clamp(pointerAngle(event) + pointer.offset, limit);
    const now = performance.now(), dt = Math.max((now - pointer.time) / 1000, .008);
    velocity = clamp(velocity * .3 + (next - pointer.angle) / dt * .7, 3);
    const rawStretch = pointer.rawStretch + event.clientY - pointer.startY;
    const softLimit = maxPull * .65, remaining = maxPull - softLimit;
    const nextStretch = rawStretch > softLimit ? softLimit + remaining * (1 - Math.exp(-(rawStretch - softLimit) / remaining)) : Math.max(-30, rawStretch < 0 ? rawStretch * .4 : rawStretch);
    stretchVelocity = clamp(stretchVelocity * .3 + (nextStretch - pointer.stretch) / dt * .7, 1200);
    pointer.moved ||= Math.abs(next - pointer.angle) > .002 || Math.abs(nextStretch - pointer.stretch) > 1;
    stretch = nextStretch; pointer.stretch = stretch;
    pointer.angle = next; pointer.time = now;
    angle = next; draw();
  });
  function release(event, cancel = false) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const held = pointer; pointer = null;
    card.classList.remove('is-tugging');
    hanger.dataset.bunnyState = 'ready';
    if (cancel || performance.now() - held.time > 100) { velocity = 0; stretchVelocity = 0; }
    else stretchVelocity = Math.min(0, stretchVelocity * .25);
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    swing(!cancel && !held.moved ? 1.25 : 0);
  }
  card.addEventListener('pointerup', event => release(event));
  card.addEventListener('pointercancel', event => release(event, true));
  card.addEventListener('lostpointercapture', event => release(event, true));
  card.addEventListener('dragstart', event => event.preventDefault());
  window.addEventListener('blur', () => { if (pointer) release({ pointerId: pointer.id }, true); });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { finishEntry(); rest(); started = false; enter(); }
  });
  card.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','ArrowDown',' ','Enter','Escape'].includes(event.key)) return;
    event.preventDefault();
    finishEntry();
    if (event.key === 'Escape') { rest(); return; }
    if (event.key === 'ArrowDown') { stop(); stretch = Math.min(maxPull, stretch + (event.repeat ? 10 : 35)); stretchVelocity = 0; draw(); return; }
    if (event.repeat) return;
    swing(event.key === 'ArrowRight' ? -1.3 : 1.3);
  });
  card.addEventListener('keyup', event => { if (event.key === 'ArrowDown') { event.preventDefault(); swing(); } });
  // Pause card motion when one of its independently movable stars is picked up.
  new MutationObserver(() => {
    if (hanger.querySelector('.about-sticker.is-held')) { stop(); velocity = 0; stretchVelocity = 0; }
  }).observe(hanger, { subtree: true, attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { finishEntry(); rest(); }
  }).observe(anchor);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { finishEntry(); rest(); }
  });
  motion.addEventListener('change', () => {
    if (motion.matches) { finishEntry(); rest(); }
  });
})();
