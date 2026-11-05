(() => {
  const header = document.querySelector('.site-header');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, arrival;
  const cancel = () => { cancelAnimationFrame(frame); frame = 0; };
  ['wheel','touchstart'].forEach(type => window.addEventListener(type,cancel,{passive:true}));
  window.addEventListener('keydown', event => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) cancel(); });
  function select(hash) {
    document.querySelectorAll('.nav-pill a').forEach(link => {
      if (link.getAttribute('href') === hash) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  header.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('aria-disabled') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href'), target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault(); cancel(); arrival?.cancel();
    select(hash);
    if (location.hash !== hash) history.pushState(null,'',hash);
    const start = scrollY, max = Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const end = Math.min(max,Math.max(0,target.getBoundingClientRect().top+start-(parseFloat(getComputedStyle(target).scrollMarginTop)||0)));
    const land = () => {
      if (motion.matches) return;
      const content = target.querySelector('.about__intro, .hero-composition') || target;
      arrival = content.animate([{opacity:.55,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:250,easing:'cubic-bezier(.2,.8,.2,1)'});
    };
    if (motion.matches) { scrollTo(0,end); return; }
    const began = performance.now(), duration = 560;
    function tick(now) {
      const t = Math.min(1,(now-began)/duration), eased = 1-Math.pow(1-t,3);
      scrollTo(0,start+(end-start)*eased);
      if (t<1) frame=requestAnimationFrame(tick); else { frame=0;land(); }
    }
    frame=requestAnimationFrame(tick);
  });
  const observer = new IntersectionObserver(() => {
    if (frame) return;
    const about=document.getElementById('about');
    select(about.getBoundingClientRect().top<innerHeight*.5 ? '#about' : '#home');
  },{threshold:[0,.2,.5,.8]});
  [document.getElementById('home'),document.getElementById('about'),document.getElementById('about-notebook')].forEach(el=>observer.observe(el));
})();
