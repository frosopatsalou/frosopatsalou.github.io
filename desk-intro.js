(() => {
  'use strict';

  const canvas = document.querySelector('.desk__canvas');
  if (!canvas) return;

  // Each pose is a held photograph, not an interpolated movement.
  // Coordinates use the same 1440 × 1024 space as the first Figma frame.
  // Pose values are [x, y, rotation]; artwork size and mirroring stay unchanged.
  const poses = [
    { name: 'first', at: 0, objects: {} },
    {
      name: 'second', at: 850,
      objects: {
        'scissors-top': [330, 145, 65],
        'ruler-top': [720, 170, 85],
        'clip-top-a': [957, 12, 45],
        'clip-top-b': [1040, 120, -105],
        'clip-top-c': [1125, -14, 0],
        'notebooks': [1175, 327, -10],
        'pen': [327, 531, 70],
        'clip-pink': [558, 577, 50],
        'clip-lime': [669, 627, 12],
        'clip-yellow': [527, 731, -25],
        'clip-magenta': [765, 704, -4],
        'stapler-yellow': [1030, 880, 35],
        'glue': [1345, 795, 8],
        'stapler-purple': [35, 890, -5],
        'ruler-bottom': [347, 990, 63],
        'scissors-bottom': [665, 1110, -40],
      },
    },
    {
      name: 'third', at: 1800,
      objects: {
        'scissors-top': [110, 135, 40],
        'ruler-top': [774, 110, 50],
        'clip-top-a': [933, -65, 0],
        'clip-top-b': [1050, -35, 15],
        'clip-top-c': [1170, 0, 45],
        'notebooks': [1370, 240, -18],
        'pen': [239, 570, 100],
        'clip-pink': [516, 590, 60],
        'clip-lime': [624, 647, 25],
        'clip-yellow': [470, 731, -12],
        'clip-magenta': [689, 743, 7],
        'stapler-yellow': [1130, 920, 15],
        'glue': [1420, 865, -15],
        'stapler-purple': [-110, 1050, -20],
        'ruler-bottom': [270, 1100, 124],
        'scissors-bottom': [760, 1190, -70],
      },
    },
    {
      name: 'final', at: 3000,
      objects: {
        'scissors-top': [60, 100, 15],
        'ruler-top': [830, -20, 7],
        'clip-top-a': [1050, -180, 120],
        'clip-top-b': [1150, -180, -25],
        'clip-top-c': [1250, -180, 50],
        'notebooks': [1480, 195, -15],
        'pen': [65, 605, 75],
        'clip-pink': [308, 839, 50],
        'clip-lime': [393, 877, 20],
        'clip-yellow': [239, 990, -20],
        'clip-magenta': [485, 985, 2],
        'stapler-yellow': [1080, 980, 0],
        'glue': [1400, 840, 0],
        'stapler-purple': [-200, 1190, 15],
        'ruler-bottom': [200, 1300, 95],
        'scissors-bottom': [920, 1450, -30],
      },
    },
  ];

  const duration = 3500;
  const items = new Map([...canvas.querySelectorAll('[data-object]')].map(item => [item.dataset.object, item]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let activePose = 0;
  const timers = [];
  canvas.dataset.introState = 'waiting';

  function applyPose(index) {
    const pose = poses[index];
    for (const [name, [x, y, rotation]] of Object.entries(pose.objects)) {
      const item = items.get(name);
      if (!item) continue;
      item.style.setProperty('--x', x);
      item.style.setProperty('--y', y);
      item.style.setProperty('--rotation', `${rotation}deg`);
    }
    activePose = index;
    canvas.dataset.animationFrame = pose.name;
  }

  function complete() {
    timers.forEach(clearTimeout);
    if (activePose !== poses.length - 1) applyPose(poses.length - 1);
    canvas.dataset.introState = 'complete';
    document.dispatchEvent(new Event('portfolio:intro-complete'));
  }

  function start() {
    if (started) return;
    started = true;
    canvas.dataset.introState = 'playing';
    if (reducedMotion.matches) { complete(); return; }
    poses.slice(1).forEach((pose, index) => {
      timers.push(setTimeout(() => applyPose(index + 1), pose.at));
    });
    timers.push(setTimeout(complete, duration));
  }

  // The loader emits this only after assets are ready and its overlay is gone.
  document.addEventListener('portfolio:ready', start, { once: true });
  reducedMotion.addEventListener('change', event => {
    if (event.matches && started && canvas.dataset.introState !== 'complete') complete();
  });
  window.addEventListener('pagehide', () => timers.forEach(clearTimeout), { once: true });
})();
