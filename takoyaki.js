(() => {
  const rail = document.querySelector('.cart-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-cart-chapter]')];
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
    rail.style.setProperty('--cart-progress', String(progress));
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
  const viewer = document.getElementById('cart-viewer');
  if (!viewer) return;
  const reset = document.querySelector('.cart-reset-view');
  const status = document.querySelector('[data-cart-caption]');
  const fallback = document.querySelector('.cart-model-fallback');
  let started = false;
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  async function loadModel() {
    if (started) return;
    started = true;
    status.textContent = 'Loading the 3D cart…';
    try {
      const { ModelViewerElement } = await import('./assets/vendor/model-viewer.min.js');
      ModelViewerElement.dracoDecoderLocation = new URL('./assets/vendor/draco/', location.href).href;
      await customElements.whenDefined('model-viewer');
      if (mobile) viewer.setAttribute('shadow-intensity', '0');
      viewer.src = mobile ? './assets/takoyaki/cart-mobile.glb' : './assets/takoyaki/cart.glb';
    } catch (error) { showFallback(); }
  }
  function showFallback() {
    started = false;
    status.textContent = 'Full render available below';
    fallback.hidden = false;
  }
  viewer.addEventListener('load', () => {
    viewer.dismissPoster();
    reset.disabled = false;
    status.textContent = 'Drag to rotate, scroll or pinch to zoom';
  });
  viewer.addEventListener('error', showFallback);
  viewer.querySelector('[slot="poster"]').addEventListener('click', loadModel);
  reset.addEventListener('click', () => {
    viewer.cameraOrbit = '-108deg 76deg 80%';
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) viewer.jumpCameraToGoal();
  });
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { loadModel(); observer.disconnect(); }
  }, { rootMargin: '350px' });
  observer.observe(viewer);
})();
