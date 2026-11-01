import {initialPassengers} from './matching.js';
const grid = (id) => `<defs><pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".17"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;
const point = (x,y,label,solid=false) => `<circle cx="${x}" cy="${y}" r="6" fill="${solid?'currentColor':'var(--paper)'}" stroke="currentColor" stroke-width="1.5"/><text x="${x+14}" y="${y+5}">${label}</text>`;

export function routeScene({detail=false}={}) {
  return `<figure class="route-scene scene match-demo" data-matching data-scene>
    <div class="scene-top mono"><span>ROUTE CORRIDOR / LETZGO</span><span>TRY A PICKUP</span></div><div class="match-toolbar"><span class="hand">drop someone along the way.</span><div><button data-add-passenger aria-pressed="false">+ Passenger</button><button data-reset-passengers>Reset</button></div></div><p class="match-help" id="match-help">Drag a passenger pin. Or focus it and use arrow keys. Everyone is headed to B.</p>
    <svg data-match-map viewBox="0 0 720 380" role="group" aria-label="Passenger pickup map; driver travels from A to B" aria-describedby="match-help">
      ${grid('route-grid')}
      <g fill="none" stroke="currentColor" opacity=".14" stroke-width="1"><path d="M0 130H720M0 250H720M160 0V380M375 0V380M590 0V380"/><path d="m0 370 490-370M240 380 480-360M0 20l510 360"/></g>
      <path class="corridor" d="M65 288C158 294 163 160 281 173S400 248 472 151 573 99 655 72" fill="none" stroke="currentColor" stroke-width="78" opacity=".045"/>
      <g fill="none" stroke="currentColor" opacity=".22" stroke-dasharray="4 5"><circle cx="221" cy="185" r="61"/><circle cx="491" cy="129" r="61"/></g>
      <path data-driver-route class="wire" d="M65 288C158 294 163 160 281 173S400 248 472 151 573 99 655 72"/>
      <path class="signal" d="M65 288C158 294 163 160 281 173S400 248 472 151 573 99 655 72"/>
      <g aria-hidden="true">${point(65,288,'A')}${point(655,72,'B')}</g>
      <text x="48" y="332">driver origin</text><text x="500" y="42">destination B</text>
      <g data-match-connectors aria-hidden="true"></g>
      <g data-passenger-pins>${initialPassengers.map(p=>`<g class="passenger-pin" data-passenger="${p.id}" transform="translate(${p.x} ${p.y})" tabindex="-1" role="img" aria-label="Passenger ${p.id}, illustrative pickup" aria-describedby="match-help"><circle class="pin-hit" r="28"/><circle class="pin-halo" r="23"/><circle class="pin-body" r="15"/><text text-anchor="middle" y="4">${p.id}</text></g>`).join('')}</g>
    </svg>
    <figcaption><span>Closest pickup ranks first.</span><span class="mono">ILLUSTRATIVE MATCHING · NOT LIVE DATA</span></figcaption>
    <div class="match-results"><div class="match-results-heading mono"><span>PICKUP RANKING</span><span>DISTANCE FROM ROUTE</span></div><ol data-match-results></ol><p data-match-status role="status" class="match-status">Move a pin to explore the ranking.</p></div>
    <p class="match-fallback">The interactive ranking needs JavaScript. The route illustration shows pickups around a shared journey.</p>
    <details class="match-method"><summary>How this sketch ranks <span>+</span></summary><p>This demo sorts pickups by their shortest straight-line distance to the drawn route, in diagram units. Everyone shares destination B. It does not model roads, travel time, direction, or LetzGo’s production matching rules.</p></details>
    ${detail?`<div class="tier-line" aria-label="Four classification tiers"><span>01 <i></i></span><span>02 <i></i></span><span>03 <i></i></span><span>04 <i></i></span><b>Road-network queries ↗</b></div><p class="diagram-note">Four tiers classify candidates before road-network queries. Exact tier names and distance thresholds are not specified in the résumé; this is a conceptual illustration.</p>`:''}
  </figure>`;
}

export function cityScene() {
 return `<figure class="city-scene scene" data-city data-scene>
   <div class="scene-top mono"><span>DISCOVERY / POPIN</span><span data-map-status>VIEWPORT 01 / 03</span></div>
   <svg viewBox="0 0 760 410" role="img" aria-label="Illustrative city map. A moving viewport selects nearby events; example markers are not live listings.">
    <defs><pattern id="city-blocks" width="112" height="86" patternTransform="rotate(-16 380 205)" patternUnits="userSpaceOnUse"><rect x="9" y="9" width="94" height="68" rx="3" fill="currentColor" opacity=".045"/><path d="M0 0H112V86" fill="none" stroke="currentColor" opacity=".22"/></pattern></defs>
    <rect width="760" height="410" fill="url(#city-blocks)"/>
    <path d="M0 390C210 300 196 191 405 180S600 76 760 46" stroke="var(--paper)" stroke-width="27" fill="none"/><path d="M0 390C210 300 196 191 405 180S600 76 760 46" stroke="currentColor" opacity=".22" fill="none" stroke-width="1"/>
    <g class="map-pins" fill="var(--paper)" stroke="currentColor" stroke-width="1.5"><circle cx="213" cy="144" r="9"/><circle cx="337" cy="267" r="9"/><circle cx="456" cy="119" r="9"/><circle cx="558" cy="247" r="9"/><circle cx="627" cy="95" r="9"/><circle cx="124" cy="309" r="9"/></g>
    <g fill="currentColor"><circle cx="213" cy="144" r="3"/><circle cx="337" cy="267" r="3"/><circle cx="456" cy="119" r="3"/><circle cx="558" cy="247" r="3"/><circle cx="627" cy="95" r="3"/><circle cx="124" cy="309" r="3"/></g>
    <g class="viewport" data-viewport><rect x="149" y="75" width="300" height="235" fill="currentColor" fill-opacity=".025" stroke="currentColor" stroke-dasharray="5 5"/><path d="M149 98V75H173m252 0h24v24m0 187v24h-24m-252 0h-24v-24" stroke="currentColor" stroke-width="2" fill="none"/><rect x="149" y="52" width="130" height="23" fill="currentColor"/><text x="159" y="68" fill="var(--paper)">visible bounds</text></g>
    <text x="230" y="139">live music</text><text x="352" y="288">coffee &amp; company</text><text x="570" y="267">a local meetup</text>
    <text class="svg-hand" x="32" y="49">a city, one window at a time.</text>
   </svg>
   <div class="city-controls"><span class="mono">ILLUSTRATIVE EVENTS</span><div aria-label="Map view"><button data-map-select="0" aria-label="Show west viewport" aria-pressed="true">01</button><button data-map-select="1" aria-label="Show central viewport" aria-pressed="false">02</button><button data-map-select="2" aria-label="Show east viewport" aria-pressed="false">03</button></div></div>
 </figure>`;
}

export const stages = [
 ['Commit','A change enters the pipeline.','GitLab CI/CD makes the delivery steps repeatable, instead of relying on a sequence of manual commands.'],
 ['Test','Check the system before shipping.','Docker-in-Docker tests exercise the application in containerized environments. This is a separate gate before delivery.'],
 ['Build','Turn the change into an artifact.','The multi-stage pipeline separates testing, building, and delivery, so a failure has a clear place to surface.'],
 ['Deliver','Get the app into people’s hands.','Automated Play Store releases carry the mobile application through delivery. Repeatable releases connect the engineering pipeline to the people using the product.']
];
export function pipeline() {
 return `<div class="pipeline scene" data-pipeline data-scene><div class="scene-top mono"><span>FROM A COMMIT TO A CITY</span><span>AUTOMATED DELIVERY</span></div><div class="pipeline-track" aria-label="Delivery stages">${stages.map(([name],i)=>`<button data-stage="${i}" aria-pressed="${i===0}"><span class="stage-dot">${i===0?'↗':String(i+1).padStart(2,'0')}</span><span>${name}</span></button>`).join('')}</div><div class="pipeline-explanation"><span class="mono" data-stage-counter>01 / 04</span><div><h3 data-stage-title>${stages[0][1]}</h3><p data-stage-description>${stages[0][2]}</p></div></div><p class="diagram-note">Select any stage to inspect it. The sequence advances automatically when motion is on.</p></div>`;
}

export function allocationScene() {
 return `<figure class="allocation-scene scene" data-scene><div class="scene-top mono"><span>EZ-ALLOCATE / SERVICE BOUNDARIES</span><span>TEAM PROJECT · 2023</span></div><svg viewBox="0 0 780 350" role="img" aria-label="React connects to Node authentication and Django allocation. Authentication signs a JWT, Django verifies the public key. Django queues CSV exports through Redis to a Celery worker, while the client polls for completion.">${grid('allocation-grid')}<g fill="none" stroke="currentColor"><path d="M100 175H300M400 175H650M350 175V280H650M100 175V70H350V175"/><path class="signal" d="M100 175H350V280H650"/></g><g fill="var(--paper)" stroke="currentColor"><circle cx="100" cy="175" r="36"/><circle cx="350" cy="175" r="41"/><circle cx="350" cy="70" r="27"/><circle cx="500" cy="280" r="28"/><circle cx="650" cy="280" r="34"/><circle cx="650" cy="175" r="29"/></g><g text-anchor="middle"><text x="100" y="180">React</text><text x="350" y="180">Django</text><text x="350" y="74">Auth</text><text x="500" y="284">Redis</text><text x="650" y="284">Celery</text><text x="650" y="179">DB</text><text x="100" y="232">coordinator</text><text x="350" y="232">allocation rules</text><text x="650" y="338">CSV worker</text><text x="218" y="60">signed JWT</text><text x="477" y="152">allotments</text></g></svg><figcaption>Validate in the API. Generate reports outside the request.</figcaption></figure>`;
}
