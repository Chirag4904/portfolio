(() => {
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pins=[[120,140],[185,240],[265,120],[320,285],[345,185],[410,130],[465,260],[520,160],[590,300],[630,110],[70,365],[320,35]];
 const map=document.querySelector('.map-demo'),mapButton=document.getElementById('map-motion');
 let view=0,mapPaused=reduced;
 function showMap(){const shift=view?270:0;document.getElementById('viewport-box').style.transform=`translateX(${shift}px)`;document.getElementById('viewport-corner').style.transform=`translateX(${shift}px)`;document.getElementById('event-pins').innerHTML=pins.map(([x,y],i)=>{const inside=x>=80+shift&&x<=370+shift&&y>=85&&y<=330;return `<g opacity="${inside?1:.22}">${inside?`<circle class="event-halo" cx="${x}" cy="${y}" r="14" fill="none" stroke="#ddd" style="animation-delay:${i*.22}s"/>`:''}<circle cx="${x}" cy="${y}" r="5" fill="${inside?'#eee':'#999'}"/></g>`}).join('');document.getElementById('bounds-label').textContent=`${view?'EAST':'WEST'} VIEWPORT / bounds → active events`;}
 function setMapMotion(){map.classList.toggle('paused',mapPaused);mapButton.textContent=mapPaused?'Resume animation':'Pause animation';mapButton.setAttribute('aria-pressed',String(mapPaused));}
 mapButton.addEventListener('click',()=>{mapPaused=!mapPaused;setMapMotion()});showMap();setMapMotion();
 const flows={backend:[
 ['Validate','Catch problems at the first boundary.','Validation starts the delivery path before more expensive testing and packaging. Keeping checks early shortens the feedback loop for changes.'],
 ['Test','Use real dependencies for meaningful checks.','Docker-in-Docker provisions PostgreSQL and Redis, runs migrations, and exercises APIs against real persistence. Vitest and configured Gatling jobs add unit-level and user-flow evidence.'],
 ['Report','Make the result inspectable.','JUnit, coverage, integration, and load-test outputs converge in a GitLab Pages portal. Commit and branch metadata connects the evidence to the change that produced it.'],
 ['Build','Reuse layers; version the artifact.','Multi-stage Docker builds package the production runtime. BuildKit registry caching reuses unchanged layers, avoiding repeated dependency work while producing a deployable image.'],
 ['Deploy','Automate the handoff to the environment.','CI supplies configuration, and an SSH deployment pulls the image and updates Docker Compose services. This makes the release procedure repeatable; availability still depends on the runtime topology.']
 ],android:[
 ['Test','Remove environment noise from visual tests.','Golden references and tests use the same Linux Flutter image. Matching the rendering environment turns pixel differences into more useful regression signals.'],
 ['Version','Keep metadata attached to the build.','Version names come from tags or pipeline inputs; dotenv artifacts carry build numbers between jobs. The release notes and store upload can refer to the same build identity.'],
 ['Sign & build','Keep signing material out of source control.','CI injects the keystore and generates signing configuration. Branch and tag rules select development APKs or signed Android App Bundles for the appropriate flavor.'],
 ['Release notes','Make documentation part of delivery.','Tag messages or changelog inputs generate build-specific Fastlane release notes. Preparing them in the pipeline reduces a manual step that is easy to miss.'],
 ['Distribute','Match the release trigger to its audience.','Feature branches produce QA APKs; dev delivers to Play internal testing; release tags trigger production uploads through Fastlane. Main builds a production AAB without automatically publishing it.']
 ]};
 const pipeline=document.querySelector('.quiet-pipeline'),pipelineButton=document.getElementById('pipeline-motion');let pipelinePaused=reduced,step=0;
 Object.entries(flows).forEach(([key,stages])=>{const row=document.querySelector(`[data-lane="${key}"]`);row.innerHTML=stages.map(([label],i)=>`<button data-stage="${i}" aria-pressed="false"><span>0${i+1}</span><strong>${label}</strong></button>`).join('');row.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.stage;document.querySelectorAll('[data-stage]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('insight-label').textContent=`${key.toUpperCase()} / ${stages[i][0]}`;document.getElementById('insight-title').textContent=stages[i][1];document.getElementById('insight-copy').textContent=stages[i][2];}));});
 function paintFlow(){document.querySelectorAll('[data-stage]').forEach(b=>b.classList.toggle('flow-active',+b.dataset.stage===step));}
 function setPipelineMotion(){pipeline.classList.toggle('flow-paused',pipelinePaused);pipelineButton.textContent=pipelinePaused?'Resume animation':'Pause animation';pipelineButton.setAttribute('aria-pressed',String(pipelinePaused));}
 pipelineButton.addEventListener('click',()=>{pipelinePaused=!pipelinePaused;setPipelineMotion()});paintFlow();setPipelineMotion();
 if(reduced){for(const button of [mapButton,pipelineButton]){button.textContent='Reduced motion';button.disabled=true;}}
 let mapVisible=true,pipelineVisible=true;
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.target===map)mapVisible=e.isIntersecting;else pipelineVisible=e.isIntersecting;})});observer.observe(map);observer.observe(pipeline);}
 if(!reduced){setInterval(()=>{if(!document.hidden&&!mapPaused&&mapVisible){view=1-view;showMap();}},4600);setInterval(()=>{if(!document.hidden&&!pipelinePaused&&pipelineVisible){step=(step+1)%5;paintFlow();}},2600);}
})();
