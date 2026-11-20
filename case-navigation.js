(() => {
  const logo = document.querySelector('.site-logo');
  const tracker = document.querySelector('.moon-index, .case-progress, .sncb-index, .spotify-index');
  if (!logo || !tracker) return;
  function alignTracker() {
    if (innerWidth <= 900) { tracker.style.removeProperty('translate'); return; }
    const logoRect = logo.getBoundingClientRect();
    const railRect = tracker.getBoundingClientRect();
    const currentOffset = parseFloat(getComputedStyle(tracker).translate) || 0;
    const offset = logoRect.left + logoRect.width / 2 - railRect.left - railRect.width / 2 + currentOffset;
    tracker.style.translate = `${offset}px 0`;
  }
  const observer = new ResizeObserver(alignTracker);
  observer.observe(logo);
  observer.observe(tracker);
  addEventListener('resize', alignTracker, { passive: true });
  document.fonts.ready.then(alignTracker);
  alignTracker();
})();
