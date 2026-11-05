(() => {
  'use strict';
  const desk = document.querySelector('.desk');
  const status = document.getElementById('drag-status');
  const tidyScopes = [...document.querySelectorAll('[data-tidy-scope]')];
  const areaFor = element => element.closest('[data-drag-area]') || desk;
  const scopeFor = element => element.closest('[data-tidy-scope]') || desk;
  let tidying = false;
  let active = null;
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
  const items = [...desk.querySelectorAll('.desk__item'), desk.querySelector('.hero-face'), ...desk.querySelectorAll('.hero-name'), ...document.querySelectorAll('[data-movable]')];
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
    [['0%', '#C4C2C9'], ['18%', '#E8E6EC'], ['45%', '#FFFFFF'], ['73%', '#F8F7FA'], ['100%', '#E2E0E6']].forEach(([offset, color]) => gradient.append(svgNode('stop', { offset, 'stop-color': color })));
    const blur = svgNode('filter', { id: `${id}-shadow`, x: '-50%', y: '-50%', width: '200%', height: '200%', 'color-interpolation-filters': 'sRGB' });
    blur.append(svgNode('feGaussianBlur', { stdDeviation: '1.3' }));
    defs.append(clip, mask, gradient, blur);
    const front = svgNode('image', { ...artwork, 'clip-path': `url(#${id}-cut)` });
    const shadowGroup = svgNode('g', { filter: `url(#${id}-shadow)` });
    const shadow = svgNode('path', { fill: '#28232F', opacity: '.24', mask: `url(#${id}-silhouette)`, transform: 'translate(1.2 2)' });
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
    if (element.classList.contains('hero-role')) { corner = 'bottom'; a = 85; b = 65; }
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

  function updateTidyVisibility() {
    if (tidying) return;
    tidyScopes.forEach(scope => {
      scope.querySelector('.tidy-button').hidden = !items.filter(element => scopeFor(element) === scope).some(element => {
        const bounds = areaFor(element).getBoundingClientRect();
        const x = (parseFloat(element.style.getPropertyValue('--drag-x')) || 0) / 100 * bounds.width;
        const y = (parseFloat(element.style.getPropertyValue('--drag-y')) || 0) / 100 * bounds.height;
        return Math.hypot(x, y) > 3;
      });
    });
  }
  function move(x, y) {
    if (!active) return;
    const { element, rect, origin } = active;
    const area = areaFor(element), bounds = area.getBoundingClientRect();
    const contained = area.dataset.dragContain === 'true';
    const inset = Number(area.dataset.dragInset || 0) / 100;
    // Cover stickers stay fully inside their board; loose stationery keeps
    // the same partially-cropped edge behaviour as the hero's objects.
    const minX = contained ? bounds.left + bounds.width * inset - rect.left : bounds.left + 24 - rect.right;
    const maxX = contained ? bounds.right - bounds.width * inset - rect.right : bounds.right - 24 - rect.left;
    const minY = contained ? bounds.top + bounds.height * inset - rect.top : bounds.top + 24 - rect.bottom;
    const maxY = contained ? bounds.bottom - bounds.height * inset - rect.bottom : bounds.bottom - 24 - rect.top;
    const dx = Math.max(minX, Math.min(maxX, x));
    const dy = Math.max(minY, Math.min(maxY, y));
    element.style.setProperty('--drag-x', origin.x + dx / bounds.width * 100);
    element.style.setProperty('--drag-y', origin.y + dy / bounds.height * 100);
    active.delta = { x: dx, y: dy };
    updateTidyVisibility();
  }
  function pick(element, pointer = null) {
    if (tidying || (element.closest('.notebook') && element.closest('.notebook').dataset.notebookState !== 'closed')) return;
    if (active) drop();
    active = {
      element, pointer,
      rect: element.getBoundingClientRect(),
      origin: { x: parseFloat(element.style.getPropertyValue('--drag-x')) || 0, y: parseFloat(element.style.getPropertyValue('--drag-y')) || 0 },
      delta: { x: 0, y: 0 },
    };
    const peers = items.filter(item => areaFor(item) === areaFor(element) && item !== element).sort((a, b) => (Number(a.style.zIndex) || 0) - (Number(b.style.zIndex) || 0));
    peers.forEach((item, index) => { if (item.style.zIndex) item.style.zIndex = index + 3; });
    element.style.zIndex = peers.length + 4;
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
    updateTidyVisibility();
    if (pointer && element.hasPointerCapture(pointer.id)) element.releasePointerCapture(pointer.id);
    announce(cancel ? 'Move cancelled.' : 'Sticker placed.');
  }
  document.addEventListener('portfolio:entrance-complete', () => {
    tidyScopes.forEach(scope => {
    const control = scope.querySelector('.tidy-button');
    control.addEventListener('click', async () => {
      if (tidying) return;
      drop();
      tidying = true;
      control.setAttribute('aria-busy', 'true');
      const animations = [];
      items.filter(element => scopeFor(element) === scope).forEach(element => {
        const from = getComputedStyle(element).translate;
        const moved = !!(parseFloat(element.style.getPropertyValue('--drag-x')) || parseFloat(element.style.getPropertyValue('--drag-y')));
        element.style.removeProperty('--drag-x');
        element.style.removeProperty('--drag-y');
        element.style.removeProperty('z-index');
        element.classList.remove('has-moved');
        peel(element, 0);
        if (moved && !motion.matches) {
          animations.push(element.animate([{ translate: from }, { translate: '0px 0px' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.catch(() => {}));
        }
      });
      await Promise.all(animations);
      tidying = false;
      control.removeAttribute('aria-busy');
      updateTidyVisibility();
      announce('All stickers tidied back into place.');
    });
    });
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
      if (element.dataset.object && !element.hasAttribute('aria-label')) element.setAttribute('aria-label', 'Pick up ' + element.dataset.object.replaceAll('-', ' '));
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
      if (!event.isPrimary || event.button !== 0 || event.target.closest('.site-header, .tidy-button, [data-notebook-control]')) return;
      const depth = element => {
        const book = element.closest('.notebook');
        return book ? [Number(getComputedStyle(book).zIndex) || 2, Number(element.style.zIndex) || 0] : [Number(element.style.zIndex) || Number(getComputedStyle(element).zIndex) || 0, 0];
      };
      const candidates = [...items].sort((a, b) => {
        const ad = depth(a), bd = depth(b);
        return bd[0] - ad[0] || bd[1] - ad[1] || items.indexOf(b) - items.indexOf(a);
      });
      const element = candidates.find(item => {
          const notebook = item.closest('.notebook');
          if (notebook && notebook.dataset.notebookState !== 'closed') return false;
        if (item.classList.contains('project-stationery') && depth(item)[0] <= 2) {
          const book = item.closest('.projects').querySelector('.notebook').getBoundingClientRect();
          if (event.clientX >= book.left && event.clientX <= book.right && event.clientY >= book.top && event.clientY <= book.bottom) return false;
        }
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
