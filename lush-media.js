(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('.lush-motion video')];
  const visible = new Set();
  const sync = () => videos.forEach(video => {
    if (visible.has(video) && !reducedMotion.matches && !document.hidden && !video.dataset.manuallyPaused) {
      video.play().catch(() => {});
    } else video.pause();
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
    });
    sync();
  }, { threshold: 0.25 });
  videos.forEach(video => {
    observer.observe(video);
    video.addEventListener('pause', () => {
      if (visible.has(video) && !document.hidden && !reducedMotion.matches) video.dataset.manuallyPaused = 'true';
    });
    video.addEventListener('play', () => delete video.dataset.manuallyPaused);
  });
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
