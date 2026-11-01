export function personalOpening(circle) {
 return `<section class="personal-opening section-pad" data-opening>
  <div class="opening-top"><span class="mono">A FEW THINGS ABOUT ME</span><span class="mono">BASED IN MUMBAI, INDIA</span></div>
  <div class="opening-name"><span class="opening-hello hand">Hey, I’m</span><h1>Chirag<span>.</span></h1><span class="opening-surname hand">Aggarwal</span><div class="opening-orbit" aria-hidden="true"><span>BACKEND</span><span>PRODUCT</span><span>DELIVERY</span></div></div>
  <div class="opening-bottom"><div class="opening-intro"><p>I’ve always thought engineers were pretty awesome.<br>Now I get to be one.</p><p class="opening-purpose">I want to build something that matters.<br>Something people actually use.</p></div><a class="opening-invitation circled" href="#how-i-think">Let me show you around <span aria-hidden="true">↓</span>${circle}</a><span class="opening-edition mono">SOFTWARE ENGINEER II<br>BACKEND · PRODUCT · INFRASTRUCTURE</span></div>
  <div class="opening-connection scene" data-opening-connection data-scene><svg class="opening-thread" viewBox="0 0 1440 200" preserveAspectRatio="none" role="img" aria-label="A connection between a person, an idea, and a product in the world. Select a point to follow the story."><path d="M-30 100C200-30 320 190 540 96S880-10 1050 100 1290 160 1470 44"/><path class="thread-light" d="M-30 100C200-30 320 190 540 96S880-10 1050 100 1290 160 1470 44"/><g data-opening-node="0" class="is-current"><circle cx="210" cy="82" r="7"/><circle class="node-ring" cx="210" cy="82" r="21"/></g><g data-opening-node="1"><circle cx="710" cy="42" r="7"/><circle class="node-ring" cx="710" cy="42" r="21"/></g><g data-opening-node="2"><circle cx="1195" cy="135" r="7"/><circle class="node-ring" cx="1195" cy="135" r="21"/></g></svg><div class="opening-point-controls" aria-label="Follow the connection"><button data-opening-select="0" aria-pressed="true">01 / A PERSON</button><button data-opening-select="1" aria-pressed="false">02 / AN IDEA</button><button data-opening-select="2" aria-pressed="false">03 / SOMETHING REAL</button></div><p data-opening-note class="hand">It starts with someone who needs it.</p></div>
  <a class="opening-scroll mono" href="#how-i-think"><span class="scroll-track" aria-hidden="true"><i></i></span>SCROLL A LITTLE. GET TO KNOW ME.</a>
 </section>`;
}

const thoughts=[
 {label:'THE PERSON',title:'Someone.<br>Somewhere.<br><em>A real need.</em>',body:'A rider looking for a shared journey. Someone wondering what’s happening nearby. I want to make things that find a place in people’s lives.',note:'start here, not with the tech.'},
 {label:'THE ENGINEERING',title:'Then, go<br><em>beneath</em><br>the surface.',body:'The simple part you see depends on a lot you don’t. Routes, queries, queues, and workers. This is where I spend much of my time.',note:'this is my kind of puzzle.'},
 {label:'THE IMPACT',title:'Make it real.<br>Put it in<br><em>their hands.</em>',body:'That’s the part I’m working toward: something people actually use. Testing, observability, and automated delivery help carry an idea into the real world.',note:'an idea is only the beginning.'}
];

export function personalJourney() {
 return `<section id="how-i-think" class="personal-journey" data-journey>
 <div class="journey-stage section-pad"><div class="journey-heading mono"><span>A LITTLE OF HOW I THINK</span><span data-journey-counter>01 — THE PERSON</span></div>
 <div class="journey-composition"><div class="thoughts">${thoughts.map((thought,i)=>`<article class="thought ${i===0?'is-current':''}" data-thought="${i}"><h2>${thought.title}</h2><p>${thought.body}</p><span class="hand">${thought.note}</span></article>`).join('')}</div>
 <div class="exploded-system" role="img" aria-label="Three layers of a product: the experience people use, the logic that connects it, and the infrastructure that delivers it.">
  <div class="layer-shadow" aria-hidden="true"></div>
  <div class="system-layer layer-delivery" data-layer="2"><div class="layer-caption mono">03 / THE THINGS THAT KEEP IT RUNNING</div><div class="layer-rail"><span>COMMIT</span><i></i><span>TEST</span><i></i><span>BUILD</span><i></i><span>SHIP</span></div><div class="delivery-lines"><span>workers / queues / releases</span><b>→</b></div><span class="layer-corner">DELIVERY</span></div>
  <div class="system-layer layer-logic" data-layer="1"><div class="layer-caption mono">02 / THE CONNECTIONS UNDERNEATH</div><svg viewBox="0 0 520 220" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="M20 150H100C180 150 130 65 250 65S350 155 410 155H500"/><path d="M20 70H90C155 70 174 160 265 160S360 60 430 60H500" stroke-dasharray="4 5"/><circle cx="250" cy="65" r="36"/><circle cx="265" cy="160" r="26"/></g><g fill="currentColor"><circle cx="100" cy="150" r="5"/><circle cx="250" cy="65" r="5"/><circle cx="410" cy="155" r="5"/></g></svg><span class="layer-corner">LOGIC</span></div>
  <div class="system-layer layer-experience" data-layer="0"><div class="layer-caption mono">01 / A SMALL MOMENT IN SOMEONE’S DAY</div><div class="layer-map"><svg viewBox="0 0 520 250" aria-hidden="true"><g fill="none" stroke="currentColor" opacity=".17"><path d="M0 60H520M0 130H520M0 200H520M70 0V250M170 0V250M280 0V250M400 0V250"/></g><path d="M75 200C190 200 126 80 275 80H425" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="75" cy="200" r="9" fill="currentColor"/><circle cx="425" cy="80" r="9" fill="currentColor"/><circle cx="425" cy="80" r="24" fill="none" stroke="currentColor"/><text x="94" y="225">you are here</text><text x="325" y="42">somewhere good</text></svg></div><span class="layer-corner">EXPERIENCE</span></div>
  <span class="layer-annotation hand">a whole world<br>behind a simple tap.</span>
 </div></div>
 <div class="journey-navigation"><div aria-label="Explore how I think">${thoughts.map((thought,i)=>`<button data-thought-select="${i}" aria-pressed="${i===0}"><span>0${i+1}</span> ${thought.label}</button>`).join('')}</div><a href="#work" class="mono">MEET THE WORK ↓</a></div>
 </div></section>`;
}

export function personalInterlude() {
 return `<section class="personal-interlude section-pad"><span class="mono">THE IDEA THAT CONNECTS IT ALL</span><p data-read-line>Building something is good.</p><p data-read-line>Someone using it?</p><p class="interlude-final" data-read-line><em>That’s the point.</em><svg viewBox="0 0 700 55" aria-hidden="true"><path d="M10 29Q280 1 688 18M58 42Q340 18 615 32"/></svg></p><span class="hand">so, here’s what I’ve been working on ↓</span></section>`;
}
