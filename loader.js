(() => {
  'use strict';
  const loader = document.getElementById('loader');
  const sticker = document.getElementById('loader-sticker');
  const fill = document.getElementById('loading-fill');
  const progress = document.getElementById('loading-progress');
  const status = document.getElementById('loading-status');
  const portfolio = document.getElementById('portfolio');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preview = new URLSearchParams(location.search).get('preview') === 'loading';
  const minimumDuration = reducedMotion ? 400 : 2800;
  const start = performance.now();
  const expressions = ['smiling', 'surprised', 'happy', 'kissy', 'determined'];
  const decoded = new Map();
  let completed = 0;
  let ready = false;
  let displayed = 0;
  let lastAria = -1;
  let activeExpression = 'smiling';

  // New page assets are automatically included as more of the portfolio is built.
  const images = [...document.querySelectorAll('#portfolio img')];
  const totalTasks = expressions.length + images.length + 2;
  const withTimeout = (promise, timeout = 12000) => new Promise(resolve => {
    const timer = setTimeout(resolve, timeout);
    Promise.resolve(promise).catch(() => {}).finally(() => {
      clearTimeout(timer);
      resolve();
    });
  });
  const task = promise => withTimeout(promise).finally(() => { completed += 1; });
  const imageTasks = expressions.map(name => task(new Promise(resolve => {
    const image = new Image();
    image.onload = async () => {
      try { await image.decode(); } catch { /* A loaded image can still be displayed. */ }
      decoded.set(name, image);
      resolve();
    };
    image.onerror = resolve;
    image.src = `./assets/stickers/${name === 'smiling' ? 'smiling-matched' : name}.webp`;
  })));
  const pageImages = images.map(image => task(image.complete ? Promise.resolve() : new Promise(resolve => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  })));
  const pageLoad = task(document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, { once: true })));
  const fonts = task(document.fonts ? document.fonts.ready : Promise.resolve());
  Promise.all([...imageTasks, ...pageImages, pageLoad, fonts]).then(() => { ready = true; });

  function showExpression(elapsed) {
    const name = expressions[Math.floor(elapsed / 900) % expressions.length];
    if (name !== activeExpression && decoded.has(name)) {
      sticker.src = decoded.get(name).src;
      activeExpression = name;
    }
  }
  function draw(value) {
    fill.style.width = `${value}%`;
    const rounded = Math.floor(value);
    if (rounded !== lastAria) {
      progress.setAttribute('aria-valuenow', rounded);
      lastAria = rounded;
    }
  }
  function finish() {
    draw(100);
    status.textContent = 'Portfolio loaded';
    setTimeout(() => {
      portfolio.inert = false;
      portfolio.removeAttribute('aria-hidden');
      document.body.classList.remove('is-loading');
      loader.classList.add('is-finished');
      setTimeout(() => loader.remove(), reducedMotion ? 0 : 420);
    }, reducedMotion ? 0 : 120);
  }
  function frame(now) {
    const elapsed = now - start;
    if (!reducedMotion) showExpression(elapsed);
    // Progress covers actual resource readiness and the brief introduction together.
    const introProgress = Math.min(elapsed / minimumDuration, 1);
    const target = preview ? (elapsed % 4000) / 4000 * 100 : Math.min((completed / totalTasks * .2 + introProgress * .8) * 100, 98);
    displayed = preview ? target : Math.max(displayed, displayed + (target - displayed) * .09);
    draw(displayed);
    if (!preview && ready && introProgress === 1) { finish(); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

