(() => {
  'use strict';
  const desk = document.querySelector('.desk');
  const status = document.getElementById('drag-status');
  let active = null;
  let topLayer = 3;
  const announce = text => { status.textContent = text; };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const peels = new Map();
  const hitMaps = new Map();
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgNode = (name, attributes = {}) => {
    const node = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  };

  // Replace only the stationery's outer element: pose and drag transforms stay
  // on this wrapper, while a single artwork layer is clipped beneath the fold.
  desk.querySelectorAll('img.desk__item').forEach(image => {
    const wrapper = document.createElement('div');
    wrapper.className = image.className;
    wrapper.dataset.object = image.dataset.object;
    image.replaceWith(wrapper);
    image.className = '';
    image.removeAttribute('data-object');
    wrapper.append(image);
  });
  const items = [...desk.querySelectorAll('.desk__item'), desk.querySelector('.hero-face'), desk.querySelector('.hero-name')];
  items.forEach((element, index) => {
    const image = element.querySelector('img');
    const host = element.querySelector('.hero-face__art') || element;
    image.classList.add('peel-source');
    const source = image.getAttribute('src');
    const id = `paper-peel-${index}`;
    const svg = svgNode('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true', class: 'peel-art' });
    const defs = svgNode('defs');
    const clip = svgNode('clipPath', { id: `${id}-cut`, clipPathUnits: 'userSpaceOnUse' });
    const cut = svgNode('path');
    clip.append(cut);
    const mask = svgNode('mask', { id: `${id}-silhouette`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 100, height: 100, style: 'mask-type:alpha' });
    const artwork = { href: source, x: 0, y: 0, width: 100, height: 100, preserveAspectRatio: 'none' };
    mask.append(svgNode('image', artwork));
    const gradient = svgNode('linearGradient', { id: `${id}-back`, gradientUnits: 'userSpaceOnUse' });
    [['0%', '#99969F'], ['18%', '#D8D6DE'], ['45%', '#FFFFFF'], ['73%', '#F4F3F6'], ['100%', '#C9C6D0']].forEach(([offset, color]) => gradient.append(svgNode('stop', { offset, 'stop-color': color })));
    const blur = svgNode('filter', { id: `${id}-shadow`, x: '-50%', y: '-50%', width: '200%', height: '200%', 'color-interpolation-filters': 'sRGB' });
    blur.append(svgNode('feGaussianBlur', { stdDeviation: '1.3' }));
    defs.append(clip, mask, gradient, blur);
    const front = svgNode('image', { ...artwork, 'clip-path': `url(#${id}-cut)` });
    const shadowGroup = svgNode('g', { filter: `url(#${id}-shadow)` });
    const shadow = svgNode('path', { fill: '#28232F', opacity: '.32', mask: `url(#${id}-silhouette)`, transform: 'translate(1.2 2)' });
    shadowGroup.append(shadow);
    const fold = svgNode('path', { fill: `url(#${id}-back)`, mask: `url(#${id}-silhouette)` });
    svg.append(defs, front, shadowGroup, fold);
    host.append(svg);
    const object = element.dataset.object || '';
    let corner = 'right', a = 65, b = 32;
    if (object.includes('scissors')) { a = 62; b = 27; }
    if (object.includes('ruler')) { a = 55; b = 100; }
    if (object.includes('notebooks')) { a = 42; b = 43; }
    if (object.includes('stapler')) { a = 43; b = 43; }
    if (object.includes('pen') || object.includes('glue')) { corner = 'left'; a = 57; b = 30; }
    if (object.includes('clip')) { a = 30; b = 32; }
    if (element.classList.contains('hero-face')) { a = 48; b = 48; }
    if (element.classList.contains('hero-name')) { corner = 'bottom'; a = 70; b = 38; }
    const point = (x, y) => corner === 'left' ? [100 - x, y] : corner === 'bottom' ? [x, 100 - y] : [x, y];
    const pair = (x, y) => point(x, y).join(' ');
    const draw = progress => {
      const ax = 100 - (100 - a) * progress;
      const by = b * progress;
      cut.setAttribute('d', `M${pair(0, 0)} L${pair(ax, 0)} L${pair(100, by)} L${pair(100, 100)} L${pair(0, 100)} Z`);
      // Reflect the lifted corner across the fold line to place its paper back.
      const dx = 100 - ax, length = dx * dx + by * by;
      const projection = length ? dx * dx / length : 0;
      const cx = 2 * (ax + projection * dx) - 100;
      const cy = 2 * projection * by;
      const shape = progress < .001 ? '' : `M${pair(ax, 0)} L${pair(100, by)} Q${pair(cx, cy)} ${pair(ax, 0)} Z`;
      fold.setAttribute('d', shape);
      shadow.setAttribute('d', shape);
      const start = point((ax + 100) / 2, by / 2), end = point(cx, cy);
      gradient.setAttribute('x1', start[0]);
      gradient.setAttribute('y1', start[1]);
      gradient.setAttribute('x2', end[0]);
      gradient.setAttribute('y2', end[1]);
      svg.dataset.peel = progress.toFixed(3);
    };
    const state = { value: 0, frame: 0, draw };
    peels.set(element, state);
    draw(0);
  });
  function peel(element, target) {
    const state = peels.get(element);
    cancelAnimationFrame(state.frame);
    if (motion.matches) { state.value = target; state.draw(target); return; }
    const from = state.value, start = performance.now();
    const tick = now => {
      const time = Math.min((now - start) / 220, 1);
      state.value = from + (target - from) * (1 - (1 - time) ** 3);
      state.draw(state.value);
      if (time < 1) state.frame = requestAnimationFrame(tick);
    };
    state.frame = requestAnimationFrame(tick);
  }

  function move(x, y) {
    if (!active) return;
    const bounds = desk.getBoundingClientRect();
    const { element, rect, origin } = active;
    // Keep at least a small part of each sticker within reach at the page edge.
    const dx = Math.max(bounds.left + 24 - rect.right, Math.min(bounds.right - 24 - rect.left, x));
    const dy = Math.max(bounds.top + 24 - rect.bottom, Math.min(bounds.bottom - 24 - rect.top, y));
    element.style.setProperty('--drag-x', origin.x + dx / bounds.width * 100);
    element.style.setProperty('--drag-y', origin.y + dy / bounds.height * 100);
    active.delta = { x: dx, y: dy };
  }
  function pick(element, pointer = null) {
    if (active) drop();
    active = {
      element, pointer,
      rect: element.getBoundingClientRect(),
      origin: { x: parseFloat(element.style.getPropertyValue('--drag-x')) || 0, y: parseFloat(element.style.getPropertyValue('--drag-y')) || 0 },
      delta: { x: 0, y: 0 },
    };
    element.style.zIndex = Math.min(++topLayer, 79);
    element.classList.add('is-held');
    peel(element, 1);
    element.setAttribute('aria-pressed', 'true');
    announce('Picked up. Move and release to stick.');
  }
  function drop(cancel = false) {
    if (!active) return;
    const { element, origin, pointer } = active;
    if (cancel) {
      element.style.setProperty('--drag-x', origin.x);
      element.style.setProperty('--drag-y', origin.y);
    } else if (Math.hypot(active.delta.x, active.delta.y) > 3) element.classList.add('has-moved');
    element.classList.remove('is-held');
    peel(element, 0);
    element.setAttribute('aria-pressed', 'false');
    active = null;
    if (pointer && element.hasPointerCapture(pointer.id)) element.releasePointerCapture(pointer.id);
    announce(cancel ? 'Move cancelled.' : 'Sticker placed.');
  }
  document.addEventListener('portfolio:entrance-complete', () => {
    document.querySelector('.desk__canvas').removeAttribute('aria-hidden');
    items.forEach(element => {
      const image = element.querySelector('img');
      const canvas = document.createElement('canvas');
      const ratio = image.naturalHeight / image.naturalWidth;
      canvas.width = Math.max(1, Math.round(512 / Math.max(1, ratio)));
      canvas.height = Math.max(1, Math.round(canvas.width * ratio));
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      hitMaps.set(element, { width: canvas.width, height: canvas.height, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data });
      element.classList.add('is-draggable');
      element.tabIndex = 0;
      element.setAttribute('role', 'button');
      element.setAttribute('aria-pressed', 'false');
      element.setAttribute('aria-describedby', 'drag-instructions');
      if (element.dataset.object) element.setAttribute('aria-label', 'Pick up ' + element.dataset.object.replaceAll('-', ' '));
      element.addEventListener('dragstart', event => event.preventDefault());
      element.addEventListener('pointermove', event => {
        if (active?.element !== element || active.pointer?.id !== event.pointerId) return;
        move(event.clientX - active.pointer.x, event.clientY - active.pointer.y);
      });
      element.addEventListener('pointerup', event => { if (active?.pointer?.id === event.pointerId) drop(); });
      element.addEventListener('pointercancel', event => { if (active?.pointer?.id === event.pointerId) drop(true); });
      element.addEventListener('lostpointercapture', () => { if (active?.element === element && active.pointer) drop(); });
      element.addEventListener('keydown', event => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          if (event.repeat) return;
          if (active?.element === element) drop(); else pick(element);
        } else if (event.key === 'Escape' && active?.element === element) {
          event.preventDefault(); drop(true);
        } else if (active?.element === element && !active.pointer && event.key.startsWith('Arrow')) {
          event.preventDefault();
          const step = event.shiftKey ? 30 : 10;
          move(active.delta.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), active.delta.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0));
        }
      });
      element.addEventListener('blur', () => { if (active?.element === element && !active.pointer) drop(); });
    });
    // Transparent rectangles around rotated stickers must not block the ruler
    // or other artwork beneath them. Pick the frontmost painted pixel instead.
    document.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('.site-header')) return;
      const candidates = [...items].sort((a, b) => (Number(b.style.zIndex) || Number(getComputedStyle(b).zIndex) || 0) - (Number(a.style.zIndex) || Number(getComputedStyle(a).zIndex) || 0) || items.indexOf(b) - items.indexOf(a));
      const element = candidates.find(item => {
        const matrix = item.querySelector('.peel-art').getScreenCTM();
        if (!matrix) return false;
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        if (point.x < 0 || point.x >= 100 || point.y < 0 || point.y >= 100) return false;
        const map = hitMaps.get(item);
        const x = Math.floor(point.x / 100 * map.width), y = Math.floor(point.y / 100 * map.height);
        return map.pixels[(y * map.width + x) * 4 + 3] > 16;
      });
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      pick(element, { id: event.pointerId, x: event.clientX, y: event.clientY });
      element.setPointerCapture(event.pointerId);
    }, { capture: true });
  }, { once: true });
})();
