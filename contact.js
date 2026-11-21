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
    const hint = document.createElement('figcaption');
    hint.className = 'contact-photo__hint';
    hint.textContent = 'Drag to reveal more';
    figure.append(canvas, hint);
    image.draggable = false;
    figure.classList.add('is-erasable');
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', 'Erase to reveal more of Froso’s photo. Press Enter to reveal the full photo.');
    let width = 0, height = 0, ratio = 1;
    let started = false, intersecting = false, introFrame = 0, pointer = null, previous = null;
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
      started = true;
      if (reduced.matches) { completeIntro(); return; }
      const began = performance.now();
      const passDuration = 220, pause = 65;
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
      introFrame = requestAnimationFrame(swipe);
    }
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
      event.preventDefault(); cancelAnimationFrame(introFrame); introFrame = 0; started = true;
      brush.fillStyle = '#fff'; brush.fillRect(0, 0, width, height); render();
      figure.classList.add('has-erased'); hint.textContent = 'Photo revealed';
    });
    resize(); new ResizeObserver(resize).observe(figure);
    const observer = new IntersectionObserver(entries => {
      intersecting = entries[0].isIntersecting;
      if (!intersecting && introFrame) return;
      start();
    }, { threshold: .25 });
    observer.observe(figure);
    document.addEventListener('portfolio:intro-complete', start, { once: true });
    reduced.addEventListener('change', () => {
      if (reduced.matches && introFrame) {
        cancelAnimationFrame(introFrame); introFrame = 0;
        completeIntro();
      }
    });
  });
})();
