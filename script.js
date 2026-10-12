document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('copy').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('aggarwalchirag4904@gmail.com');
    status.textContent = 'Email copied to clipboard.';
  } catch {
    status.textContent = 'Email: aggarwalchirag4904@gmail.com';
  }
});
(() => {
 const root=document.querySelector('.award-slideshow');if(!root)return;
 const slides=[...root.querySelectorAll('.award-slide')],dots=[...root.querySelectorAll('[data-award-slide]')],pause=document.getElementById('award-pause');
 let current=0,paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches,hovered=false;
 function show(index){current=index;slides.forEach((slide,i)=>{slide.classList.toggle('is-current',i===current);slide.setAttribute('aria-hidden',String(i!==current))});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)))}
 function setPaused(){pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play photo slideshow':'Pause photo slideshow')}
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
 pause.addEventListener('click',()=>{paused=!paused;setPaused()});
 root.addEventListener('mouseenter',()=>hovered=true);root.addEventListener('mouseleave',()=>hovered=false);
 let visible=true;if('IntersectionObserver' in window)new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(root);
 setInterval(()=>{if(!paused&&!hovered&&visible&&!document.hidden&&!root.contains(document.activeElement))show((current+1)%slides.length)},5000);
 setPaused();
})();
