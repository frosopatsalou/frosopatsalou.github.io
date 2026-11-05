(() => {
  const legacy = { '#about':'about.html', '#work':'work.html', '#contact':'contact.html' };
  if (!document.body.dataset.page && legacy[location.hash]) { location.replace(new URL(legacy[location.hash],location.href)); return; }
  const header = document.querySelector('.site-header');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let navigating = false;
  header.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && !url.hash) {
      event.preventDefault(); scrollTo({top:0,behavior:motion.matches?'instant':'smooth'}); return;
    }
    if (motion.matches) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    document.body.classList.add('is-page-leaving');
    const main = document.getElementById('portfolio');
    const transition = main.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -12px'}],{duration:160,easing:'ease-in',fill:'forwards'});
    transition.finished.then(()=>location.assign(url.href));
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      navigating=false;
      document.body.classList.remove('is-page-leaving');
      document.getElementById('portfolio').getAnimations().forEach(animation=>animation.cancel());
    }
  });
})();
