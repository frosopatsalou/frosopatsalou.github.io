(() => {
  const main = document.getElementById('portfolio');
  const about = document.querySelector('.about');
  if (about) new ResizeObserver(() => {
    const rect = about.getBoundingClientRect();
    about.style.setProperty('--about-drag-x-unit', `${rect.width / 100}px`);
    about.style.setProperty('--about-drag-y-unit', `${rect.height / 100}px`);
  }).observe(about);
  // Lazy screenshots below the fold must never keep a visible page inert.
  const images = [...main.querySelectorAll('img')].filter(img =>
    img.matches('.notebook__base, .notebook__binding, .notebook__left-page, .notebook__right-page') ||
    (img.loading !== 'lazy' && img.getBoundingClientRect().top < innerHeight));
  const assetsReady = Promise.all([document.fonts.ready, ...images.map(img => img.decode().catch(() => {}))]);
  Promise.race([assetsReady, new Promise(resolve => setTimeout(resolve, 12000))]).then(async () => {
    main.inert = false;
    main.removeAttribute('aria-hidden');
    document.dispatchEvent(new Event('portfolio:intro-complete'));
    await window.portfolioPageTransition?.reveal();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const content=main.querySelector('.about__intro, .empty-page');
      content?.animate([{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  });
})();
