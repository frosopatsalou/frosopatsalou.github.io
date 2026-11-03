(() => {
  'use strict';
  const desk = document.querySelector('.desk');
  const status = document.getElementById('drag-status');
  let active = null;
  let topLayer = 3;
  const announce = text => { status.textContent = text; };

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
    element.setAttribute('aria-pressed', 'false');
    active = null;
    if (pointer && element.hasPointerCapture(pointer.id)) element.releasePointerCapture(pointer.id);
    announce(cancel ? 'Move cancelled.' : 'Sticker placed.');
  }
  document.addEventListener('portfolio:entrance-complete', () => {
    document.querySelector('.desk__canvas').removeAttribute('aria-hidden');
    const items = [...desk.querySelectorAll('.desk__item'), desk.querySelector('.hero-face')];
    items.forEach(element => {
      element.classList.add('is-draggable');
      element.tabIndex = 0;
      element.setAttribute('role', 'button');
      element.setAttribute('aria-pressed', 'false');
      element.setAttribute('aria-describedby', 'drag-instructions');
      if (element.dataset.object) element.setAttribute('aria-label', 'Pick up ' + element.dataset.object.replaceAll('-', ' '));
      element.addEventListener('dragstart', event => event.preventDefault());
      element.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        pick(element, { id: event.pointerId, x: event.clientX, y: event.clientY });
        element.setPointerCapture(event.pointerId);
      });
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
  }, { once: true });
})();
