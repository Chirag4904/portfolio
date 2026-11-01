import {initialPassengers,rankPickups} from './matching.js';
// import {sketchSound} from './sketch-audio.js';

const svgNS='http://www.w3.org/2000/svg';
document.querySelectorAll('[data-matching]').forEach(demo=>{
  const svg=demo.querySelector('[data-match-map]');
  const path=svg.querySelector('[data-driver-route]');
  const pins=svg.querySelector('[data-passenger-pins]');
  const connectors=svg.querySelector('[data-match-connectors]');
  const results=demo.querySelector('[data-match-results]');
  const status=demo.querySelector('[data-match-status]');
  const addButton=demo.querySelector('[data-add-passenger]');
  const route=Array.from({length:181},(_,i)=>{
    const p=path.getPointAtLength(path.getTotalLength()*i/180);
    return {x:p.x,y:p.y};
  });
  let passengers=initialPassengers.map(p=>({...p}));
  let nextID=4, placing=false, drag=null, frame=0;
  const limit=5;
  const clamp=(x,y)=>({x:Math.max(24,Math.min(696,x)),y:Math.max(28,Math.min(350,y))});
  function position(event) {
    const matrix=svg.getScreenCTM();
    if(!matrix) return null;
    const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    return clamp(p.x,p.y);
  }
  function setPlacing(value) {
    placing=value;
    demo.classList.toggle('is-placing',value);
    addButton.setAttribute('aria-pressed',String(value));
    addButton.textContent=value?'Cancel placement':'+ Passenger';
  }
  function render(announce=false) {
    frame=0;
    const ranked=rankPickups(passengers,route);
    for(const passenger of passengers) {
      let pin=pins.querySelector(`[data-passenger="${passenger.id}"]`);
      if(!pin) {
        pin=document.createElementNS(svgNS,'g');
        pin.dataset.passenger=passenger.id;
        pin.classList.add('passenger-pin');
        pin.setAttribute('role','button');
        pin.setAttribute('tabindex','0');
        pin.setAttribute('aria-describedby','match-help');
        pin.innerHTML=`<circle class="pin-hit" r="28"/><circle class="pin-halo" r="23"/><circle class="pin-body" r="15"/><text text-anchor="middle" y="4">${passenger.id}</text>`;
        pins.append(pin);
      }
      const rank=ranked.findIndex(p=>p.id===passenger.id)+1;
      pin.setAttribute('role','button');
      pin.setAttribute('tabindex','0');
      pin.setAttribute('transform',`translate(${passenger.x} ${passenger.y})`);
      pin.setAttribute('aria-label',`Passenger ${passenger.id}, rank ${rank}. Pickup ${Math.round(passenger.x)}, ${Math.round(passenger.y)}. Arrow keys move; Delete removes.`);
      pin.classList.toggle('is-best',rank===1);
    }
    pins.querySelectorAll('[data-passenger]').forEach(pin=>{
      if(!passengers.some(p=>p.id===Number(pin.dataset.passenger))) pin.remove();
    });
    connectors.innerHTML=ranked.map(p=>`<path d="M${p.x} ${p.y}L${p.nearest.x} ${p.nearest.y}"/><circle cx="${p.nearest.x}" cy="${p.nearest.y}" r="3"/>`).join('');
    results.innerHTML=ranked.map((p,i)=>`<li data-rank-passenger="${p.id}"><span class="match-rank">${String(i+1).padStart(2,'0')}</span><span>Passenger ${p.id}${i===0?' <small>closest</small>':''}</span><span>${Math.round(p.distance)} <small>units</small></span></li>`).join('');
    addButton.disabled=passengers.length>=limit;
    if(announce) status.textContent=ranked.length ? `${ranked.map((p,i)=>`${i+1}: passenger ${p.id}`).join(' · ')}. Closest pickup is ${Math.round(ranked[0].distance)} diagram units from the route.` : 'No passengers yet. Add a passenger to begin.';
  }
  function addAt(point) {
    if(!point || passengers.length>=limit) return;
    const id=nextID++;
    passengers.push({id,...point});
    setPlacing(false);
    render(true);
    pins.querySelector(`[data-passenger="${id}"]`).focus({preventScroll:true});
    // sketchSound('paper');
  }
  addButton.addEventListener('click',event=>{
    if(placing) {setPlacing(false);status.textContent='Placement cancelled.';return;}
    // Keyboard activation adds a focused pin immediately; pointer users choose a location.
    if(event.detail===0) addAt({x:360,y:190});
    else {setPlacing(true);status.textContent='Tap or click the map to place a pickup. Escape cancels.';}
  });
  svg.addEventListener('click',event=>{
    if(placing && !event.target.closest('[data-passenger]')) addAt(position(event));
  });
  // SVG children do not consistently honor touch-action; suppress panning only on pins.
  svg.addEventListener('touchstart',event=>{
    if(event.target.closest('[data-passenger]')) event.preventDefault();
  },{passive:false});
  svg.addEventListener('pointerdown',event=>{
    const pin=event.target.closest('[data-passenger]');
    if(!pin || drag || !event.isPrimary || event.button!==0) return;
    event.preventDefault();
    setPlacing(false);
    const passenger=passengers.find(p=>p.id===Number(pin.dataset.passenger));
    const point=position(event);
    if(!point) return;
    drag={id:passenger.id,pointer:event.pointerId,origin:{x:passenger.x,y:passenger.y},offset:{x:point.x-passenger.x,y:point.y-passenger.y}};
    svg.setPointerCapture(event.pointerId);
    pin.focus({preventScroll:true});
    pin.classList.add('is-dragging');
  });
  svg.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.pointer) return;
    const point=position(event);
    if(!point) return;
    const passenger=passengers.find(p=>p.id===drag.id);
    Object.assign(passenger,clamp(point.x-drag.offset.x,point.y-drag.offset.y));
    if(!frame) frame=requestAnimationFrame(()=>render());
    // sketchSound();
  });
  function finishDrag(cancel=false) {
    if(!drag) return;
    const active=drag;
    drag=null;
    if(frame) {cancelAnimationFrame(frame);frame=0;}
    if(cancel) Object.assign(passengers.find(p=>p.id===active.id),active.origin);
    pins.querySelector(`[data-passenger="${active.id}"]`)?.classList.remove('is-dragging');
    if(svg.hasPointerCapture(active.pointer)) svg.releasePointerCapture(active.pointer);
    render(true);
    // if(!cancel) sketchSound('paper');
  }
  svg.addEventListener('pointerup',event=>{if(event.pointerId===drag?.pointer) finishDrag();});
  svg.addEventListener('pointercancel',event=>{if(event.pointerId===drag?.pointer) finishDrag(true);});
  svg.addEventListener('lostpointercapture',event=>{if(event.pointerId===drag?.pointer) finishDrag(true);});
  demo.addEventListener('keydown',event=>{
    if(event.key==='Escape') {
      if(drag) {event.preventDefault();finishDrag(true);}
      if(placing) {event.preventDefault();setPlacing(false);status.textContent='Placement cancelled.';addButton.focus();}
      return;
    }
    const pin=event.target.closest('[data-passenger]');
    if(!pin || drag) return;
    const id=Number(pin.dataset.passenger);
    const passenger=passengers.find(p=>p.id===id);
    const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(directions[event.key]) {
      event.preventDefault();
      const [dx,dy]=directions[event.key], step=event.shiftKey?25:8;
      Object.assign(passenger,clamp(passenger.x+dx*step,passenger.y+dy*step));
      render(true); // sketchSound();
    } else if(event.key==='Enter' || event.key===' ') {
      event.preventDefault();status.textContent=`Passenger ${id} selected. Use arrow keys to move, Shift for larger steps, or Delete to remove.`;
    } else if(event.key==='Delete' || event.key==='Backspace') {
      event.preventDefault();
      passengers=passengers.filter(p=>p.id!==id);
      render(true);addButton.focus();
    }
  });
  demo.querySelector('[data-reset-passengers]').addEventListener('click',()=>{
    finishDrag(true);setPlacing(false);
    passengers=initialPassengers.map(p=>({...p}));nextID=4;
    render(true); // sketchSound('paper');
  });
  render();
});
