(() => {
  if (!document.body.dataset.page && location.hash === '#work') history.replaceState(null, '', '#case-studies');
  const legacy = { '#about': 'about.html', '#contact': 'contact.html' };
  if (!document.body.dataset.page && legacy[location.hash]) {
    location.replace(new URL(legacy[location.hash], location.href)); return;
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function syncHomeNavigation() {
    if (document.body.dataset.page) return;
    const isWork = location.hash === '#case-studies';
    document.querySelectorAll('#primary-navigation a').forEach(link => {
      const label = link.textContent.trim();
      if (label !== 'Home' && label !== 'Work') return;
      if ((label === 'Work') === isWork) link.setAttribute('aria-current', 'page');
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
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    const url = destination(link);
    if (!url || motion.matches || !window.portfolioPageTransition) return;
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
