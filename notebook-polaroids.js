(() => {
  const book = document.querySelector('.notebook');
  if (!book) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...book.querySelectorAll('#notebook-interests video')];
  let inView = false;
  function syncPlayback() {
    videos.forEach(video => {
      const play = inView && !document.hidden && !reduceMotion.matches &&
        book.dataset.notebookState === 'open' && book.dataset.activeSpread === 'interests' &&
        !book.dataset.spreadTurn && video.closest('.interest-polaroid').classList.contains('is-top') &&
        !video.closest('.interest-stack').classList.contains('is-cycling');
      if (play) {
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        video.muted = true;
        video.play().catch(() => {}); // Keep the poster if a browser blocks autoplay.
      } else video.pause();
    });
  }
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncPlayback();
  }, { threshold: .02 }).observe(book);
  new MutationObserver(syncPlayback).observe(book, {
    attributes: true,
    attributeFilter: ['data-notebook-state', 'data-active-spread', 'data-spread-turn']
  });
  document.addEventListener('visibilitychange', syncPlayback);
  reduceMotion.addEventListener('change', syncPlayback);
  book.querySelectorAll('#notebook-interests .interest-stack').forEach(stack => {
    let busy = false;
    const cards = () => [...stack.children];
    function sync() {
      const top = stack.lastElementChild;
      cards().forEach(card => {
        const active = card === top;
        card.classList.toggle('is-top', active);
        card.tabIndex = active ? 0 : -1;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-hidden', String(!active));
        card.setAttribute('aria-label', `${card.querySelector('img').alt}. Show next photo`);
      });
      syncPlayback();
    }
    async function cycle(card, keyboard) {
      if (busy || card !== stack.lastElementChild || book.dataset.notebookState !== 'open' || book.dataset.spreadTurn) return;
      busy = true;
      stack.classList.add('is-cycling');
      syncPlayback();
      const base = getComputedStyle(card).transform;
      // Scale the flick with the page rather than using fixed screen pixels.
      const width = card.getBoundingClientRect().width;
      const direction = stack.classList.contains('interest-stack--travel') ? 1 : -1;
      const lifted = `translate(${direction * width * .72}px, ${-width * .22}px) rotate(${direction * 14}deg) ${base}`;
      let animation;
      try {
        if (!reduceMotion.matches) {
          animation = card.animate([
            { transform: base },
            { transform: lifted }
          ], { duration: 190, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' });
          await animation.finished;
        }
        stack.prepend(card);
        animation?.cancel();
        sync();
        if (keyboard) stack.lastElementChild.focus({ preventScroll: true });
        if (!reduceMotion.matches) {
          animation = card.animate([
            { transform: lifted },
            { transform: base, offset: .85 },
            { transform: base }
          ], { duration: 230, easing: 'cubic-bezier(.2,.85,.3,1)', fill: 'forwards' });
          await animation.finished;
        }
      } catch (error) {
        if (error.name !== 'AbortError') throw error;
      } finally {
        animation?.cancel();
        busy = false;
        stack.classList.remove('is-cycling');
        sync();
      }
    }
    stack.addEventListener('click', event => {
      const card = event.target.closest('.interest-polaroid');
      if (card) cycle(card, false);
    });
    stack.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key) || event.repeat) return;
      const card = event.target.closest('.interest-polaroid');
      if (!card) return;
      event.preventDefault();
      cycle(card, true);
    });
    sync();
  });
})();
