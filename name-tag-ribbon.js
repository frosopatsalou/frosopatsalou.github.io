(() => {
  const control = document.querySelector('[data-ribbon-control]');
  if (!control) return;
  const art = control.querySelector('img');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0, y = 0, vx = 0, vy = 0, frame = 0, last = 0, held = null;
  let width = 113, height = 138, maxX = 85, maxY = 85;
  const clamp = (value, limit) => Math.max(-limit, Math.min(limit,value));
  function draw() {
    const rotation = clamp(x * .002 - y * .0012, .16);
    art.style.transform = `rotate(${rotation}rad) scale(${Math.max(.65,1+x/(width*.9))},${Math.max(.65,1+y/(height*.75))})`;
    control.dataset.pullX = x.toFixed(2); control.dataset.pullY = y.toFixed(2);
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    control.classList.remove('is-moving');
  }
  function rest() { stop(); x=0; y=0; vx=0; vy=0; draw(); }
  function tick(now) {
    frame = 0;
    if (held || document.hidden || motion.matches) { rest(); return; }
    const dt = Math.min((now-last)/1000,5);last=now;
    const damping=3.2, spring=95, frequency=Math.sqrt(spring-damping*damping);
    const decay=Math.exp(-damping*dt), c=Math.cos(frequency*dt), s=Math.sin(frequency*dt);
    const nextX=decay*(x*c+(vx+damping*x)/frequency*s);
    const nextY=decay*(y*c+(vy+damping*y)/frequency*s);
    vx=decay*(vx*c-(damping*vx+spring*x)/frequency*s);
    vy=decay*(vy*c-(damping*vy+spring*y)/frequency*s);
    x=nextX;y=nextY;draw();
    if(Math.abs(x)+Math.abs(y)<.15 && Math.abs(vx)+Math.abs(vy)<.5){rest();return;}
    frame=requestAnimationFrame(tick);
  }
  function releaseMotion() {
    if(motion.matches){rest();return;}
    control.classList.add('is-moving');
    if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  new ResizeObserver(()=>{
    width=Math.max(30,control.clientWidth);height=Math.max(40,control.clientHeight);
    maxX=Math.min(85,Math.max(45,width*1.4));maxY=Math.min(85,Math.max(45,height*.7));
    draw();
  }).observe(control);
  control.addEventListener('pointerdown',event=>{
    if(!event.isPrimary || event.button!==0 || held)return;
    event.preventDefault();stop();
    held={id:event.pointerId,startX:event.clientX,startY:event.clientY,x,y,time:performance.now(),moved:false};
    vx=0;vy=0;control.classList.add('is-tugging');control.setPointerCapture(event.pointerId);
  });
  control.addEventListener('pointermove',event=>{
    if(!held || held.id!==event.pointerId)return;
    const nextX=maxX*Math.tanh((event.clientX-held.startX+held.x)/maxX);
    const nextY=maxY*Math.tanh((event.clientY-held.startY+held.y)/maxY);
    const now=performance.now(),dt=Math.max(.008,(now-held.time)/1000);
    vx=clamp((nextX-x)/dt,500);vy=clamp((nextY-y)/dt,500);
    held.moved ||= Math.abs(nextX-x)+Math.abs(nextY-y)>1;
    x=nextX;y=nextY;held.time=now;draw();
  });
  function release(event,cancel=false){
    if(!held || held.id!==event.pointerId)return;
    const previous=held;held=null;control.classList.remove('is-tugging');
    if(cancel || performance.now()-previous.time>100){vx=0;vy=0;}
    else{vx*=.2;vy*=.2;}
    if(!cancel && !previous.moved){x=22;y=8;draw();}
    if(control.hasPointerCapture(event.pointerId))control.releasePointerCapture(event.pointerId);
    releaseMotion();
  }
  control.addEventListener('pointerup',event=>release(event));
  control.addEventListener('pointercancel',event=>release(event,true));
  control.addEventListener('lostpointercapture',event=>release(event,true));
  control.addEventListener('dragstart',event=>event.preventDefault());
  control.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(event.key))return;
    event.preventDefault();stop();
    if(event.key==='Escape'){rest();return;}
    if(event.repeat)return;
    if(event.key==='Enter'||event.key===' '){x=25;y=10;draw();releaseMotion();return;}
    x=clamp(x+(event.key==='ArrowRight'?18:event.key==='ArrowLeft'?-18:0),maxX);
    y=clamp(y+(event.key==='ArrowDown'?18:event.key==='ArrowUp'?-18:0),maxY);
    vx=0;vy=0;draw();
  });
  control.addEventListener('keyup',event=>{if(event.key.startsWith('Arrow')){event.preventDefault();releaseMotion();}});
  window.addEventListener('blur',()=>{if(held)release({pointerId:held.id},true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)rest();});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting && !held)rest();}).observe(control);
  motion.addEventListener('change',()=>{if(motion.matches)rest();});
})();
