(() => {
  'use strict';
  const section = document.querySelector('.value-prop');
  if (!section) return;
  const cloud = section.querySelector('.value-prop__cloud');
  const layer = document.getElementById('cloud-fluff-layer');
  const source = document.getElementById('fluff-source').src;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let cloudOnScreen = false;
  const syncCloudMotion = () => cloud.classList.toggle('is-cloud-active', cloudOnScreen && !document.hidden);
  new IntersectionObserver(entries => {
    cloudOnScreen = entries[0].isIntersecting;
    syncCloudMotion();
  }, {rootMargin: '100px', threshold: 0}).observe(cloud);
  document.addEventListener('visibilitychange', syncCloudMotion);
  const spins = new Map();
  let held = null;
  const sentence = cloud.querySelector('.value-prop__sentence');
  function fitCloud() {
    const safeHeight = Math.ceil(sentence.getBoundingClientRect().height * 1.65 + 32);
    cloud.style.setProperty('--cloud-safe-height', `${safeHeight}px`);
  }
  new ResizeObserver(fitCloud).observe(sentence);
  document.fonts.ready.then(fitCloud);
  fitCloud();

  section.querySelectorAll('.value-link').forEach(button => {
    button.addEventListener('click', event => {
      const lettering = event.target.closest('svg');
      const target = lettering || button.querySelector('img');
      const matrix = new DOMMatrix(getComputedStyle(target).transform);
      const angle = (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360;
      spins.get(target)?.cancel();
      button.dataset.spins = String(Number(button.dataset.spins || 0) + 1);
      button.dataset.lastSpin = lettering ? 'text' : 'circle';
      const animation = target.animate(motion.matches ? [{ filter: 'brightness(1)' }, { filter: 'brightness(1.15)' }, { filter: 'brightness(1)' }] : [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${Math.ceil(angle / 360) * 360 + 360}deg)` }], {
        duration: motion.matches ? 180 : 850,
        easing: 'cubic-bezier(.16,1,.3,1)',
      });
      spins.set(target, animation);
      animation.finished.catch(() => {}).then(() => { if (spins.get(target) === animation) spins.delete(target); });
    });
  });

  function position(puff, x, y) {
    puff.x = x + puff.offsetX - puff.size / 2;
    puff.y = y + puff.offsetY - puff.size / 2;
    puff.element.style.transform = `translate3d(${puff.x}px,${puff.y}px,0) rotate(${puff.rotation}deg)`;
  }
  function makePuff(x, y, size, offsetX = 0, offsetY = 0) {
    while (layer.children.length >= 18) layer.firstElementChild.remove();
    const element = document.createElement('div');
    element.className = 'cloud-puff';
    element.style.setProperty('--puff-size', `${size}px`);
    const image = document.createElement('img');
    image.src = source;
    image.alt = '';
    image.draggable = false;
    element.append(image);
    layer.append(element);
    const puff = { element, size, offsetX, offsetY, rotation: Math.random() * 26 - 13 };
    position(puff, x, y);
    return puff;
  }
  function release(puffs) {
    puffs.forEach((puff, index) => {
      const { element, x, y, rotation } = puff;
      const drift = (index - 1) * 32 + Math.random() * 20 - 10;
      const distance = Math.min(220, innerHeight * .28);
      const transform = (dx, dy, turn, scale) => `translate3d(${x + dx}px,${y + dy}px,0) rotate(${rotation + turn}deg) scale(${scale})`;
      const animation = element.animate(motion.matches ? [{ opacity: 1 }, { opacity: 0 }] : [
        { transform: transform(0, 0, 0, 1), opacity: 1, offset: 0 },
        { transform: transform(drift * .25, distance * .2, 8, 1.04), opacity: .95, offset: .35 },
        { transform: transform(drift * .7, distance * .65, 19, 1.1), opacity: .5, offset: .72 },
        { transform: transform(drift, distance, 28, 1.18), opacity: 0, offset: 1 },
      ], { duration: motion.matches ? 200 : 2300 + index * 180, easing: 'ease-in', fill: 'forwards' });
      animation.finished.catch(() => {}).finally(() => element.remove());
    });
  }
  function pluck(x, y) {
    const size = Math.min(96, Math.max(64, innerWidth * .065));
    return [makePuff(x, y, size), makePuff(x, y, size * .6, -size * .4, size * .25), makePuff(x, y, size * .48, size * .42, size * .12)];
  }
  function letGo() {
    if (!held) return;
    const { puffs, id } = held;
    held = null;
    cloud.classList.remove('is-plucking');
    if (cloud.hasPointerCapture(id)) cloud.releasePointerCapture(id);
    release(puffs);
  }
  cloud.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || held) return;
    event.preventDefault();
    held = { id: event.pointerId, puffs: pluck(event.clientX, event.clientY) };
    cloud.classList.add('is-plucking');
    cloud.setPointerCapture(event.pointerId);
    if (!motion.matches) cloud.querySelector('.value-prop__cloud-art').animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.1)' }, { filter: 'brightness(1)' }], { duration: 180 });
  });
  cloud.addEventListener('pointermove', event => {
    if (held?.id === event.pointerId) held.puffs.forEach(puff => position(puff, event.clientX, event.clientY));
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => cloud.addEventListener(name, event => { if (held?.id === event.pointerId) letGo(); }));
  cloud.querySelector('.cloud-fluff-control').addEventListener('click', event => {
    if (event.detail !== 0) return;
    const bounds = cloud.getBoundingClientRect();
    release(pluck(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { held = null; cloud.classList.remove('is-plucking'); layer.replaceChildren(); }
  });
})();
