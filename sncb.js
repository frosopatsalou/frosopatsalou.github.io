(() => {
  const rail = document.querySelector('.sncb-index');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-sncb-chapter]')];
  const meter = rail.querySelector('[role=progressbar]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function update() {
    frame = 0;
    const end = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    let active = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= 190) active = i; });
    if (scrollY >= end - 3) active = sections.length - 1;
    links.forEach((link, i) => {
      if (i === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-read', i < active);
    });
    const start = sections[0].getBoundingClientRect().top + scrollY;
    const progress = Math.max(0, Math.min(1, (scrollY - start + 180) / Math.max(1, end - start + 180)));
    rail.style.setProperty('--sncb-progress', String(progress));
    meter.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    document.getElementById(link.hash.slice(1))?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.fonts.ready.then(schedule);
  schedule();
})();

(() => {
  const video = document.querySelector('.sncb-motion-board video');
  const button = document.querySelector('.sncb-motion-toggle');
  if (!video || !button) return;
  button.removeAttribute('aria-pressed');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = reduced.matches;
  let visible = false;
  function sync() {
    if (visible && !manuallyPaused && !document.hidden) video.play().catch(() => {});
    else video.pause();
    button.textContent = manuallyPaused ? 'Play motion' : 'Pause motion';
  }
  button.addEventListener('click', () => { manuallyPaused = !manuallyPaused; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .1 }).observe(video);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { manuallyPaused = reduced.matches; sync(); });
  sync();
})();

(() => {
  const track = document.querySelector('.sncb-journey-track');
  if (!track) return;
  const viewport = track.parentElement;
  const original = track.firstElementChild.cloneNode(true);
  let previousWidth = 0;
  function fill() {
    const width = viewport.clientWidth;
    if (!width || width === previousWidth) return;
    previousWidth = width;
    const group = document.createElement('div');
    group.className = 'sncb-journey-group';
    group.append(original.cloneNode(true));
    track.replaceChildren(group);
    // Each half must fill the viewport, including at the loop's final frame.
    const repeatWidth = group.getBoundingClientRect().width;
    const repeats = Math.max(1, Math.ceil((width + 1) / Math.max(1, repeatWidth)));
    for (let i = 1; i < repeats; i++) {
      const copy = original.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      group.append(copy);
    }
    const distance = group.getBoundingClientRect().width;
    const twin = group.cloneNode(true);
    twin.setAttribute('aria-hidden', 'true');
    track.append(twin);
    track.style.setProperty('--journey-distance', `${distance}px`);
    track.style.setProperty('--journey-duration', `${distance / 48}s`);
  }
  document.fonts.ready.then(() => { previousWidth = 0; fill(); });
  new ResizeObserver(fill).observe(viewport);
  fill();
})();

(() => {
  const ticket = document.querySelector('.sncb-ticket');
  if (!ticket) return;
  const main = ticket.querySelector('.sncb-ticket__main');
  const stub = ticket.querySelector('.sncb-ticket__stub');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const curl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  curl.classList.add('sncb-paper-curl');
  curl.setAttribute('aria-hidden', 'true');
  curl.innerHTML = '<defs><linearGradient id="sncb-fibre-shade"><stop stop-color="#7e8eaa" stop-opacity=".35"/><stop offset=".3" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path fill="url(#sncb-fibre-shade)"/>';
  stub.append(curl);
  const fold = curl.querySelector('path');
  const shade = curl.querySelector('linearGradient');
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  let frame = 0, last = 0, current = 0, target = 0;
  let start = 0, length = 500, mobile = false, w = 0, h = 0, mainW = 0, mainH = 0;
  function measure() {
    const rect = ticket.getBoundingClientRect();
    start = Math.max(0, rect.top + scrollY - 190);
    length = Math.max(360, rect.height * 1.05);
    mobile = innerWidth <= 640;
    w = stub.offsetWidth; h = stub.offsetHeight;
    mainW = main.offsetWidth; mainH = main.offsetHeight;
    curl.setAttribute('viewBox', `0 0 ${w} ${h}`);
    shade.setAttribute('x2', mobile ? '0%' : '100%');
    shade.setAttribute('y2', mobile ? '100%' : '0%');
    schedule();
  }
  function draw(p) {
    const mainEdge = [], edge = [], innerEdge = [];
    const front = p * 1.22;
    // Small, irregular fibres open progressively behind a travelling tear tip.
    // The still joined portion stays in place until the tear reaches it.
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const opened = ease((front - t) / .22);
      const fibre = (1.1 + .65 * Math.sin(i * 2.73) + .4 * Math.sin(i * 5.17)) * opened;
      const gap = opened * (mobile ? 15 : 22) * (.62 + .38 * (1 - t));
      const d = gap + fibre;
      mainEdge.push(mobile ? `${t * mainW}px ${mainH - fibre}px` : `${mainW - fibre}px ${t * mainH}px`);
      edge.push(mobile ? [t * w, d] : [d, t * h]);
      innerEdge.push(mobile ? [t * w, d + 7 * opened] : [d + 7 * opened, t * h]);
    }
    if (p < .00001) {
      main.style.clipPath = ''; stub.style.clipPath = ''; fold.setAttribute('d', '');
    } else {
      main.style.clipPath = mobile
        ? `polygon(0 0,100% 0,${mainEdge.reverse().join(',')})`
        : `polygon(0 0,${mainEdge.join(',')},0 100%)`;
      stub.style.clipPath = mobile
        ? `polygon(${edge.map(v => `${v[0]}px ${v[1]}px`).join(',')},100% 100%,0 100%)`
        : `polygon(${edge.map(v => `${v[0]}px ${v[1]}px`).join(',')},100% 100%,100% 0)`;
      fold.setAttribute('d', `M${edge.map(v => v.join(',')).join(' L')} L${innerEdge.reverse().map(v => v.join(',')).join(' L')} Z`);
    }
    const release = ease((p - .72) / .28);
    stub.style.transformOrigin = mobile ? '100% 0' : '0 100%';
    stub.style.transform = `translate(${release * (mobile ? 3 : 14)}px,${release * 26}px) rotate(${release * (mobile ? 1.8 : 3)}deg)`;
    stub.style.setProperty('--paper-lift', `${release * 8}px`);
  }
  function tick(now) {
    frame = 0;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    current += (target - current) * (1 - Math.exp(-dt / 100));
    if (Math.abs(target - current) < .00005) current = target;
    draw(current);
    if (current !== target) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function schedule() {
    target = reduced.matches ? 0 : clamp((scrollY - start) / length);
    if (!frame) frame = requestAnimationFrame(tick);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  reduced.addEventListener('change', () => { if (reduced.matches) current = 0; schedule(); });
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(ticket);
  measure();
})();
