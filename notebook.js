(() => {
  const book=document.querySelector('.notebook');
  if(!book) return;
  const button=book.querySelector('.notebook__indicator'),cover=book.querySelector('.notebook__closed'),spread=book.querySelector('.notebook__open'),pages=book.querySelector('.notebook__pages');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let animations=[],targetOpen=false,turn=0;
  function finish() {
    book.dataset.notebookState=targetOpen?'open':'closed';
    cover.inert=targetOpen;
    book.setAttribute('aria-label',`${targetOpen?'Open':'Closed'} A Work in Progress notebook`);
    animations.forEach(animation=>animation.cancel());animations=[];
    spread.style.visibility='';pages.style.visibility='';
    button.setAttribute('aria-disabled','false');
    button.setAttribute('aria-expanded',String(targetOpen));
    button.setAttribute('aria-label',targetOpen?'Close notebook':'Open notebook');
    button.querySelector('.notebook__hint').textContent=targetOpen?'Close':'Open';
    button.querySelector('.notebook__arrow').textContent=targetOpen?'›':'‹';
    book.querySelector('.notebook__status').textContent=`Notebook ${targetOpen?'opened':'closed'}.`;
  }
  function animate(element,keyframes,options) {
    const animation=element.animate(keyframes,{fill:'both',...options});animations.push(animation);return animation.finished.catch(()=>{});
  }
  button.addEventListener('click',async()=>{
    if(!['closed','open'].includes(book.dataset.notebookState)||cover.querySelector('.is-held'))return;
    const token=++turn;
    targetOpen=book.dataset.notebookState==='closed';
    book.dataset.notebookState=targetOpen?'opening':'closing';
    cover.inert=true;button.setAttribute('aria-disabled','true');
    if(motion.matches){finish();return;}
    const width=cover.offsetWidth,scale=spread.getBoundingClientRect().height/cover.offsetHeight;
    const end=`translateX(${width*.4466}px) rotateY(-180deg) scale(${scale})`;
    const poses=[{transform:'translateX(0) rotateY(0) scale(1)',offset:0},{transform:`translateX(${width*.4466}px) rotateY(-15deg) scale(${scale})`,offset:.32},{transform:end,offset:1}];
    spread.style.visibility='visible';
    const jobs=[animate(cover,poses,{duration:650,easing:'cubic-bezier(.3,0,.2,1)',direction:targetOpen?'normal':'reverse'})];
    jobs.push(animate(spread,[{clipPath:'inset(0 0 0 50%)',opacity:0},{clipPath:'inset(0 0 0 50%)',opacity:1,offset:.25},{clipPath:'inset(0)',opacity:1}],{duration:650,direction:targetOpen?'normal':'reverse'}));
    if(targetOpen){
      pages.style.visibility='visible';
      [...pages.children].forEach((page,index)=>{
        page.style.zIndex=3-index;
        jobs.push(animate(page,[{transform:'rotateY(0)',visibility:'visible'},{transform:'rotateY(-180deg)',visibility:'hidden'}],{duration:620,delay:400+index*170,easing:'cubic-bezier(.3,0,.25,1)'}));
      });
    }
    await Promise.all(jobs);
    if(token===turn)finish();
  });
  motion.addEventListener('change',()=>{if(motion.matches&&animations.length){++turn;finish();}});
})();
