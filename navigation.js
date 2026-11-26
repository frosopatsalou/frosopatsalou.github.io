(() => {
  if (!document.body.dataset.page && location.hash === '#work') history.replaceState(null, '', '#case-studies');
  const legacy = { '#about': 'about.html' };
  if (!document.body.dataset.page && legacy[location.hash]) {
    location.replace(new URL(legacy[location.hash], location.href)); return;
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function syncHomeNavigation() {
    if (document.body.dataset.page) return;
    const active = location.hash === '#contact' ? 'Contact' : location.hash === '#case-studies' ? 'Work' : 'Home';
    document.querySelectorAll('#primary-navigation a').forEach(link => {
      const label = link.textContent.trim();
      if (!['Home', 'Work', 'Contact'].includes(label)) return;
      if (label === active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  syncHomeNavigation();
  window.addEventListener('hashchange', syncHomeNavigation);
  window.addEventListener('popstate', syncHomeNavigation);
  function destination(link) {
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') ||
        link.closest('[aria-disabled="true"]') || link.hasAttribute('data-no-transition')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    return url;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-no-transition][href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const from = scrollY;
    const to = Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,from+target.getBoundingClientRect().top-(parseFloat(getComputedStyle(target).scrollMarginTop)||0)));
    history.replaceState(null,'',link.hash);
    dispatchEvent(new Event('portfolio:anchor-navigation'));
    scrollTo({ top: to, behavior: motion.matches ? 'instant' : 'smooth' });
  },true);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    const url = destination(link);
    if (!url || !window.portfolioPageTransition) return;
    event.preventDefault();
    const rect = link.getBoundingClientRect();
    const point = event.detail ? { x: event.clientX, y: event.clientY } : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    window.portfolioPageTransition.navigate(url, point).then(syncHomeNavigation);
  });
  ['pointerover', 'focusin'].forEach(type => document.addEventListener(type, event => {
    const url = destination(event.target.closest('a[href]'));
    if (url && url.pathname !== location.pathname) window.portfolioPageTransition?.prefetch(url);
  }));
})();
