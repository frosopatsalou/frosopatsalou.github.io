(() => {
  'use strict';
  // Keep the original audio element alive while subsequent pages load in a
  // same-origin content frame. Normal visits remain normal full HTML pages.
  if (parent !== window) {
    let host;
    try { host = parent.portfolioMusicHost; } catch (_) {}
    if (!host) return;
    const report = () => host.page(location.href, document.title, window);
    const modal = () => host.modal(!!document.querySelector('#cookie-banner:not([hidden]), dialog[open]'));
    new MutationObserver(modal).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden','open'] });
    document.addEventListener('portfolio:navigation-revealed', report);
    document.addEventListener('portfolio:intro-complete', report);
    document.addEventListener('portfolio:ready', report);
    addEventListener('portfolio:anchor-navigation', report);
    addEventListener('hashchange', report);
    addEventListener('scroll', () => host.scroll(scrollY), { passive: true });
    const observer = new MutationObserver(() => {
      if (!document.getElementById('portfolio')?.inert && !document.documentElement.classList.contains('is-navigation-busy')) { report(); observer.disconnect(); }
    });
    observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['inert','class'] });
    report();
    modal();
    return;
  }
  let frame, resolveReady, currentWindow, loading = false;
  const music = () => window.portfolioMusicSession;
  const signal = (page, y = 0) => dispatchEvent(new CustomEvent('portfolio:music-location', { detail: { spotify: new URL(page).pathname.endsWith('/spotify.html'), y } }));
  window.portfolioMusicHost = {
    canCarry: () => !!music() && (!music().audio.paused || !!frame),
    async open(url) {
      if (!frame) {
        const player = music().root;
        // The destination page owns its analytics; avoid an extra host history view.
        const measurement = window.PORTFOLIO_ANALYTICS?.measurementId;
        if (measurement) window[`ga-disable-${measurement}`] = true;
        document.body.append(player);
        document.body.classList.add('is-music-host');
        frame = document.createElement('iframe');
        frame.className = 'portfolio-music-frame';
        frame.title = 'Portfolio page';
        document.body.append(frame);
        addEventListener('popstate', () => {
          signal(location.href);
          frame.contentWindow.location.replace(location.href);
        });
      }
      loading = true;
      signal(url.href);
      history.pushState({ portfolioMusic: true }, '', url.href);
      const ready = new Promise(resolve => { resolveReady = resolve; });
      frame.src = url.href;
      const timeout = setTimeout(() => { resolveReady?.(); resolveReady = null; }, 16000);
      await ready; clearTimeout(timeout);
    },
    navigateFrame(url) {
      loading = true;
      signal(url.href);
      history.pushState({ portfolioMusic: true }, '', url.href);
      frame.contentWindow.location.replace(url.href);
    },
    page(href, title, child) {
      currentWindow = child;
      document.title = title;
      if (!loading) history.replaceState({ portfolioMusic: true }, '', href);
      signal(href, child.scrollY);
      if (!child.document.getElementById('portfolio')?.inert && !child.document.documentElement.classList.contains('is-navigation-busy')) {
        loading = false;
        resolveReady?.(); resolveReady = null;
      }
      const vinyl = child.document.querySelector('.spotify-art');
      vinyl?.classList.toggle('is-music-playing', !music().audio.paused);
    },
    scroll(y) { dispatchEvent(new CustomEvent('portfolio:music-scroll', { detail: { y } })); },
    modal(open) { if (music()) music().root.style.visibility = open ? 'hidden' : ''; },
    syncVinyl() { currentWindow?.document.querySelector('.spotify-art')?.classList.toggle('is-music-playing', !music().audio.paused); }
  };
})();
