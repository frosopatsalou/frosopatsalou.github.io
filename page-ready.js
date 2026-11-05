(() => {
  const main = document.getElementById('portfolio');
  Promise.all([document.fonts.ready,...[...main.querySelectorAll('img')].map(img => img.decode().catch(() => {}))]).then(() => {
    main.inert = false;
    main.removeAttribute('aria-hidden');
    document.dispatchEvent(new Event('portfolio:intro-complete'));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const content=main.querySelector('.about__layout, .empty-page');
      content?.animate([{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:280,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  });
})();
