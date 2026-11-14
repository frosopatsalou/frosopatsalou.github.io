(() => {
  const content = document.querySelector('.work-content');
  if (!content) return;
  const sections = [...content.querySelectorAll('[data-work-section]')];
  const rail = document.querySelector('.case-progress');
  const chapterLinks = [...rail.querySelectorAll('[data-chapter]')];
  const meter = rail.querySelector('[role="progressbar"]');
  const overview = document.getElementById('overview');
  const stage = overview.querySelector('.overview-stage');
  const viewport = overview.querySelector('.overview-window');
  const track = overview.querySelector('.overview-track');
  const cards = [...track.children];
  const previous = overview.querySelector('[data-overview-prev]');
  const next = overview.querySelector('[data-overview-next]');
  const counter = overview.querySelector('.overview-count');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 650px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  let pinned = false, distance = 0, travel = 0, frame = 0, activeCard = -1, activeChapter = -1;

  function cardState(index) {
    if (index === activeCard) return;
    activeCard = index;
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
  }
  function update() {
    frame = 0;
    if (pinned) {
      const offset = parseFloat(getComputedStyle(stage).top);
      const progress = clamp((offset - overview.getBoundingClientRect().top) / Math.max(1, travel));
      track.style.transform = `translate3d(${-distance * progress}px,0,0)`;
      cardState(Math.round(progress * (cards.length - 1)));
    } else {
      cardState(Math.min(cards.length - 1, Math.round(viewport.scrollLeft / (cards[0].offsetWidth + 20))));
    }
    const cursor = scrollY + (innerWidth <= 899 ? 240 : 150);
    const tops = sections.map(section => section.getBoundingClientRect().top + scrollY);
    let chapter = 0;
    tops.forEach((top, index) => { if (cursor >= top) chapter = index; });
    const fraction = chapter === sections.length - 1 ? 0 : clamp((cursor - tops[chapter]) / Math.max(1, tops[chapter + 1] - tops[chapter]));
    let progress = (chapter + fraction) / (sections.length - 1);
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) progress = 1;
    if (scrollY < 10) progress = 0;
    rail.style.setProperty('--story-progress', String(progress));
    meter.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      chapterLinks.forEach((link, index) => {
        if (index === chapter) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
        link.classList.toggle('is-read', index < chapter);
      });
      if (innerWidth <= 899) {
        const nav = rail.querySelector('nav'), link = chapterLinks[chapter];
        nav.scrollTo({ left: link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2, behavior: 'instant' });
      }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function layout() {
    pinned = desktop.matches && !motion.matches;
    overview.classList.toggle('is-pinned', pinned);
    track.style.transform = '';
    viewport.scrollLeft = 0;
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    travel = distance * .9;
    overview.style.height = pinned ? `${stage.offsetHeight + travel}px` : '';
    overview.querySelector('.overview-scroll-hint').textContent = pinned ? 'Scroll to explore ↗' : 'Swipe to explore ↔';
    activeCard = -1;
    schedule();
  }
  function goToCard(index) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    const behavior = motion.matches ? 'instant' : 'smooth';
    if (pinned) {
      const start = overview.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(stage).top);
      scrollTo({ top: start + travel * index / (cards.length - 1), behavior });
    } else viewport.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior });
  }
  previous.addEventListener('click', () => goToCard(activeCard - 1));
  next.addEventListener('click', () => goToCard(activeCard + 1));
  viewport.addEventListener('scroll', schedule, { passive: true });
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goToCard(activeCard + (event.key === 'ArrowRight' ? 1 : -1));
  });
  // Trackpads may send horizontal wheel events even in the vertically pinned view.
  viewport.addEventListener('wheel', event => {
    if (!pinned || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    scrollBy({ top: event.deltaX, behavior: 'instant' });
  }, { passive: false });
  content.parentElement.addEventListener('click', event => {
    const link = event.target.closest('a[data-no-transition][href^="#"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    target.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  window.addEventListener('scroll', schedule, { passive: true });
  new ResizeObserver(layout).observe(stage);
  window.addEventListener('resize', layout);
  motion.addEventListener('change', layout);
  document.fonts.ready.then(layout);
  layout();
})();
