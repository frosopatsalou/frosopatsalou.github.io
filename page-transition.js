(() => {
  'use strict';
  const key = 'portfolio-circle-navigation';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const prefetches = new Map();
  let overlay, animation, navigating = false, revealPromise, safetyTimer;
  let point = { x: innerWidth / 2, y: innerHeight / 2 };
  let arrival;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
    if (saved && saved.destination === location.pathname + location.search &&
        Date.now() - saved.time < 30000 && /^#[0-9a-f]{6}$/i.test(saved.color)) arrival = saved;
  } catch (_) { /* Navigation still works when browser storage is unavailable. */ }

  function radius() {
    return Math.hypot(Math.max(point.x, innerWidth - point.x), Math.max(point.y, innerHeight - point.y)) + 8;
  }
  const circle = size => `circle(${size}px at ${point.x}px ${point.y}px)`;
  function makeOverlay(color, covered = false) {
    overlay?.remove();
    overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    // Cover the destination before its stylesheets load, including on a cold visit.
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647', background: color,
      pointerEvents: 'auto', clipPath: covered ? 'none' : circle(0),
      willChange: 'clip-path', contain: 'strict'
    });
    document.documentElement.append(overlay);
    document.documentElement.classList.add('is-navigation-busy');
    return overlay;
  }
  function duration(name, fallback) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
  }
  async function uncover() {
    clearTimeout(safetyTimer);
    if (!overlay) return;
    overlay.dataset.phase = 'revealing';
    animation?.cancel();
    if (!motion.matches) {
      animation = overlay.animate([
        { clipPath: circle(radius()) }, { clipPath: circle(0) }
      ], { duration: duration('--duration-page-reveal', 360), easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' });
      await animation.finished.catch(() => {});
    }
    overlay?.remove();
    overlay = null;
    document.documentElement.classList.remove('is-navigation-busy');
    document.body?.removeAttribute('aria-busy');
    document.dispatchEvent(new Event('portfolio:navigation-revealed'));
  }
  function reveal() { return revealPromise ||= uncover(); }
  function prefetch(url) {
    if (url.origin !== location.origin || prefetches.has(url.href)) return;
    const task = fetch(url.href, { credentials: 'same-origin', priority: 'low' }).then(async response => {
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      doc.querySelectorAll('img[src]').forEach(image => {
        const source = image.getAttribute('src');
        if (!source || source.startsWith('data:')) return;
        const warm = new Image(); warm.src = new URL(source, url).href;
      });
      doc.querySelectorAll('link[rel="stylesheet"][href]').forEach(sheet => {
        const link = document.createElement('link');
        link.rel = 'prefetch'; link.as = 'style'; link.href = new URL(sheet.getAttribute('href'), url).href;
        document.head.append(link);
      });
    }).catch(() => {});
    prefetches.set(url.href, task);
  }
  async function navigate(url, origin) {
    if (navigating) return;
    navigating = true;
    prefetch(url);
    point = origin;
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--color-purple').trim();
    const color = /^#[0-9a-f]{6}$/i.test(rgb) ? rgb : '#7300ED';
    makeOverlay(color);
    overlay.dataset.phase = 'covering';
    document.body.setAttribute('aria-busy', 'true');
    const main = document.getElementById('portfolio');
    if (main) main.inert = true;
    animation = overlay.animate([{ clipPath: circle(0) }, { clipPath: circle(radius()) }], {
      duration: motion.matches ? 0 : duration('--duration-page-cover', 460),
      easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards'
    });
    await animation.finished.catch(() => {});
    overlay.dataset.phase = 'covered';
    if (url.pathname === location.pathname && url.search === location.search) {
      if (url.hash) {
        history.pushState(null, '', url);
        try { document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView(); } catch (_) {}
      } else scrollTo({ top: 0, behavior: 'instant' });
      await uncover();
      if (main) main.inert = false;
      navigating = false;
      return;
    }
    if (url.origin === location.origin) {
      try {
        sessionStorage.setItem(key, JSON.stringify({
          destination: url.pathname + url.search, color,
          x: point.x / innerWidth, y: point.y / innerHeight, time: Date.now()
        }));
      } catch (_) {}
    }
    location.assign(url.href);
  }
  if (arrival) {
    point = { x: Math.min(1, Math.max(0, arrival.x)) * innerWidth, y: Math.min(1, Math.max(0, arrival.y)) * innerHeight };
    makeOverlay(arrival.color, true).dataset.phase = 'loading';
    safetyTimer = setTimeout(reveal, 18000);
  }
  window.portfolioPageTransition = { incoming: Boolean(arrival), navigate, prefetch, reveal };
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    animation?.cancel();
    overlay?.remove(); overlay = null; navigating = false;
    document.documentElement.classList.remove('is-navigation-busy');
    document.body.removeAttribute('aria-busy');
    const main = document.getElementById('portfolio');
    if (main) main.inert = false;
    try { sessionStorage.removeItem(key); } catch (_) {}
  });
})();
