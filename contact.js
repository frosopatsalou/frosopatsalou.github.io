(() => {
  const email = 'frosopatsalou@gmail.com';
  document.querySelectorAll('.contact-section').forEach(section => {
    const socials = section.querySelector('.contact-socials');
    const status = section.querySelector('.contact-copy-status');
    const expanders = [...socials.querySelectorAll('[data-contact-expand]')];
    const suppressed = new WeakSet();
    let feedbackTimer;
    function closeAll() { expanders.forEach(button => button.classList.remove('is-expanded')); }
    expanders.forEach(button => {
      function open() {
        if (button.disabled || suppressed.has(button)) return;
        closeAll(); button.classList.add('is-expanded');
      }
      button.addEventListener('pointerenter', open);
      button.addEventListener('focus', open);
      button.addEventListener('pointerleave', () => suppressed.delete(button));
      button.addEventListener('blur', () => {
        button.classList.remove('is-expanded'); suppressed.delete(button);
      });
      button.addEventListener('click', () => {
        suppressed.add(button); closeAll();
      });
    });
    socials.addEventListener('pointerleave', () => {
      expanders.forEach(button => {
        if (document.activeElement !== button || suppressed.has(button)) button.classList.remove('is-expanded');
      });
    });
    section.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
      closeAll();
      const socialEmail = socials.querySelector('[data-copy-email]');
      suppressed.add(socialEmail);
      let copied = false;
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch (_) {
        const field = document.createElement('textarea');
        field.value = email;
        field.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(field);
        field.select();
        copied = document.execCommand('copy');
        field.remove();
        button.focus({ preventScroll: true });
      }
      clearTimeout(feedbackTimer);
      status.textContent = copied ? 'Email copied!' : `Please copy: ${email}`;
      button.classList.toggle('is-copied', copied);
      feedbackTimer = setTimeout(() => {
        status.textContent = '';
        section.querySelectorAll('.is-copied').forEach(item => item.classList.remove('is-copied'));
      }, 2400);
    }));
  });
})();

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-erase-photo]').forEach(async figure => {
    const image = figure.querySelector('img');
    try { await image.decode(); } catch (_) { return; }
    const canvas = document.createElement('canvas');
    canvas.className = 'contact-photo__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d');
    const mask = document.createElement('canvas');
    const brush = mask.getContext('2d');
    if (!context || !brush) { image.style.opacity = '1'; return; }
    const hint = document.createElement('p');
    hint.className = 'contact-photo__hint';
    hint.textContent = 'Drag to reveal more';
    const group = document.createElement('div');
    group.className = 'contact-photo-group';
    figure.before(group); group.append(figure);
    const actions = document.createElement('div');
    actions.className = 'contact-photo-actions';
    const reveal = document.createElement('button');
    reveal.type = 'button'; reveal.className = 'contact-photo-reveal';
    reveal.setAttribute('aria-label', 'Reveal whole photo'); reveal.title = 'Reveal whole photo';
    reveal.setAttribute('aria-pressed', 'false');
    reveal.innerHTML = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12C7 3 17 3 22 12C17 21 7 21 2 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
    hint.setAttribute('role', 'status');
    actions.append(hint, reveal);
    const controlCell = document.createElement('div');
    controlCell.className = 'contact-photo-controls'; controlCell.append(actions);
    figure.closest('.contact-section').querySelector('.contact-footer').append(controlCell); figure.append(canvas);
    image.draggable = false;
    figure.classList.add('is-erasable');
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'Erase to reveal more of Froso’s photo. Press Enter to reveal the full photo.');
    let width = 0, height = 0, ratio = 1;
    let started = false, intersecting = false, introFrame = 0, startFrame = 0, fullPhoto = false, pointer = null, previous = null;
    function render() {
      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(mask, 0, 0);
      context.globalCompositeOperation = 'source-over';
    }
    function resize() {
      const rect = figure.getBoundingClientRect();
      const nextRatio = Math.min(devicePixelRatio || 1, 2);
      if (!rect.width || !rect.height || (width === rect.width && height === rect.height && ratio === nextRatio)) return;
      const saved = document.createElement('canvas');
      saved.width = mask.width; saved.height = mask.height;
      saved.getContext('2d').drawImage(mask, 0, 0);
      width = rect.width; height = rect.height; ratio = nextRatio;
      canvas.width = mask.width = Math.round(width * ratio);
      canvas.height = mask.height = Math.round(height * ratio);
      brush.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (saved.width && saved.height) brush.drawImage(saved, 0, 0, width, height);
      render();
    }
    function stroke(from, to, size) {
      brush.save();
      brush.lineCap = brush.lineJoin = 'round';
      brush.strokeStyle = brush.fillStyle = '#fff';
      brush.shadowColor = '#fff';
      brush.shadowBlur = size * .025;
      brush.lineWidth = size;
      brush.beginPath(); brush.moveTo(from.x, from.y); brush.lineTo(to.x, to.y); brush.stroke();
      // Small uneven fibres soften the edge into a rubbed paper stroke.
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        const radius = size * (.47 + Math.sin(i * 3.7 + to.x * .025) * .025);
        brush.beginPath();
        brush.arc(to.x + Math.cos(angle) * radius, to.y + Math.sin(angle) * radius, size * .035, 0, Math.PI * 2);
        brush.fill();
      }
      brush.restore();
    }
    // Three distinct rubbed strokes, with a brief pause between each pass.
    function introPoint(pass, t) {
      const paths = [
        { x: .15, y: .40, dx: .67, dy: -.18 },
        { x: .82, y: .40, dx: -.66, dy: .20 },
        { x: .16, y: .78, dx: .65, dy: -.18 }
      ];
      const p = paths[pass];
      return { x: width * (p.x + p.dx * t), y: height * (p.y + p.dy * t + Math.sin(t * Math.PI) * .025) };
    }
    function revealPass(pass, from = 0, to = 1) {
      for (let t = from; t < to; t += .012) {
        stroke(introPoint(pass, t), introPoint(pass, Math.min(t + .012, to)), width * .24);
      }
    }
    function completeIntro() {
      for (let pass = 0; pass < 3; pass++) revealPass(pass);
      render(); figure.dataset.wipes = '3'; figure.classList.add('has-erased');
    }
    function start() {
      if (started || !intersecting || document.getElementById('portfolio')?.inert) return;
      // Begin as soon as the photo is exposed by the page transition.
      const cover = document.querySelector('.page-transition');
      if (cover) {
        const clip = getComputedStyle(cover).clipPath.match(/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/);
        const rect = figure.getBoundingClientRect();
        const probe = { x: rect.left + rect.width * .15, y: rect.top + rect.height * .4 };
        const exposed = clip && Number(clip[1]) < Math.hypot(probe.x - Number(clip[2]), probe.y - Number(clip[3])) - rect.width * .12;
        if (!exposed) {
          if (!startFrame) startFrame = requestAnimationFrame(() => { startFrame = 0; start(); });
          return;
        }
      }
      started = true;
      if (reduced.matches) { completeIntro(); return; }
      const began = performance.now() - 16;
      const passDuration = 145, pause = 30;
      const last = [0, 0, 0];
      function swipe(now) {
        const elapsed = now - began;
        for (let pass = 0; pass < 3; pass++) {
          const t = Math.max(0, Math.min(1, (elapsed - pass * (passDuration + pause)) / passDuration));
          const eased = t * t * (3 - 2 * t);
          if (eased > last[pass]) revealPass(pass, last[pass], eased);
          last[pass] = eased;
          if (t === 1) figure.dataset.wipes = String(pass + 1);
        }
        render();
        if (last[2] < 1) introFrame = requestAnimationFrame(swipe);
        else { introFrame = 0; figure.classList.add('has-erased'); }
      }
      swipe(performance.now());
    }
    function revealWholePhoto() {
      cancelAnimationFrame(introFrame); cancelAnimationFrame(startFrame); introFrame = startFrame = 0; started = true;
      if (pointer !== null && figure.hasPointerCapture(pointer)) figure.releasePointerCapture(pointer);
      pointer = null; previous = null;
      brush.fillStyle = '#fff'; brush.fillRect(0, 0, width, height); render();
      figure.classList.add('has-erased');
      hint.textContent = 'Photo revealed';
      fullPhoto = true;
      reveal.classList.add('is-full');
      reveal.setAttribute('aria-pressed', 'true');
      reveal.setAttribute('aria-label', 'Hide photo and replay three wipes');
      reveal.title = 'Hide photo and replay three wipes';
    }
    function replayWipes() {
      cancelAnimationFrame(introFrame); cancelAnimationFrame(startFrame); introFrame = startFrame = 0;
      if (pointer !== null && figure.hasPointerCapture(pointer)) figure.releasePointerCapture(pointer);
      pointer = null; previous = null; fullPhoto = false; started = false;
      brush.clearRect(0, 0, width, height); render();
      figure.dataset.wipes = '0'; hint.textContent = 'Drag to reveal more';
      reveal.classList.remove('is-full');
      reveal.setAttribute('aria-pressed', 'false');
      reveal.setAttribute('aria-label', 'Reveal whole photo'); reveal.title = 'Reveal whole photo';
      start();
    }
    reveal.addEventListener('click', () => { if (fullPhoto) replayWipes(); else revealWholePhoto(); });
    function point(event) {
      const rect = figure.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    figure.addEventListener('pointerdown', event => {
      if (event.button !== 0 || pointer !== null) return;
      cancelAnimationFrame(introFrame); introFrame = 0; started = true;
      pointer = event.pointerId;
      figure.setPointerCapture(pointer);
      figure.focus({ preventScroll: true });
      event.preventDefault();
      hint.textContent = 'Drag to reveal more';
      previous = point(event);
      stroke(previous, { x: previous.x + .01, y: previous.y }, Math.max(42, width * .19));
      render(); figure.classList.add('has-erased');
    });
    figure.addEventListener('pointermove', event => {
      if (event.pointerId !== pointer) return;
      const samples = event.getCoalescedEvents?.();
      for (const item of samples?.length ? samples : [event]) {
        const current = point(item);
        stroke(previous, current, Math.max(42, width * .19)); previous = current;
      }
      render();
    });
    function release(event) { if (event.pointerId === pointer) { pointer = null; previous = null; } }
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => figure.addEventListener(type, release));
    figure.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault(); revealWholePhoto();
    });
    resize(); new ResizeObserver(resize).observe(figure);
    const observer = new IntersectionObserver(entries => {
      intersecting = entries[0].isIntersecting;
      if (!intersecting && introFrame) return;
      start();
    }, { threshold: 0 });
    observer.observe(figure);
    document.addEventListener('portfolio:intro-complete', start, { once: true });
    document.addEventListener('portfolio:navigation-revealed', start, { once: true });
    reduced.addEventListener('change', () => {
      if (reduced.matches && introFrame) {
        cancelAnimationFrame(introFrame); introFrame = 0;
        completeIntro();
      }
    });
  });
})();
