(() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'case-preview';
  dialog.setAttribute('aria-labelledby', 'case-preview-title');
  dialog.innerHTML = `<div class="case-preview__bar"><h2 id="case-preview-title"></h2><div class="case-preview__controls"><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="fit">Fit</button><button type="button" data-zoom="in" aria-label="Zoom in">+</button><a target="_blank" rel="noopener noreferrer">Open original ↗</a><button type="button" data-close aria-label="Close preview"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div><div class="case-preview__viewport"><div class="case-preview__canvas"><img class="case-preview__image" alt=""></div></div><p class="case-preview__hint">Zoom in to read the details, then scroll or swipe to explore.</p>`;
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const viewport = dialog.querySelector('.case-preview__viewport');
  const title = dialog.querySelector('h2');
  let zoom = 1, fitWidth = 0, opener, previousOverflow;
  function resize(fit = false) {
    if (!image.naturalWidth) return;
    if (fit) fitWidth = Math.min(image.naturalWidth, viewport.clientWidth - 32, (viewport.clientHeight - 32) * image.naturalWidth / image.naturalHeight);
    const oldWidth = image.getBoundingClientRect().width || fitWidth;
    const nextWidth = fitWidth * zoom;
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2;
    const centerY = viewport.scrollTop + viewport.clientHeight / 2;
    image.style.width = `${nextWidth}px`;
    viewport.scrollLeft = centerX * nextWidth / oldWidth - viewport.clientWidth / 2;
    viewport.scrollTop = centerY * nextWidth / oldWidth - viewport.clientHeight / 2;
    dialog.querySelector('[data-zoom="out"]').disabled = zoom <= 1;
    dialog.querySelector('[data-zoom="in"]').disabled = zoom >= 8;
  }
  document.addEventListener('click', async event => {
    const link = event.target.closest('a[data-case-preview]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    opener = link;
    zoom = 1;
    image.style.width = '0px';
    image.alt = link.querySelector('img')?.alt || 'Project preview';
    title.textContent = image.alt;
    dialog.querySelector('a').href = link.href;
    image.src = link.href;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    await image.decode().catch(() => {});
    if (!dialog.open) return;
    resize(true);
    viewport.scrollTo(0, 0);
  }, true);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; opener?.focus({ preventScroll: true }); });
  dialog.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.zoom;
    zoom = action === 'fit' ? 1 : Math.max(1, Math.min(8, zoom * (action === 'in' ? 1.6 : 1 / 1.6)));
    resize(action === 'fit');
  }));
  addEventListener('resize', () => { if (dialog.open) resize(true); });
})();
