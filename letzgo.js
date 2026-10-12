const architectureCopy={
 matching:['Matching without blocking requests','Scheduled or HTTP-triggered work enters Redis/BullMQ queues. Workers generate recurring intents, filter spatial candidates, evaluate stop sequences, score matches, and backfill missing route segments. Notifications and WebSocket updates communicate results.'],
 live:['Live coordination, scoped to a trip','Socket.IO relays driver location updates to the associated trip room and handles chat and presence. High-frequency GPS updates avoid the primary database; online status and last-seen timestamps are persisted. The trade-off is an ephemeral live path.'],
 payments:['A payment lifecycle tied to the trip','Stripe Connect supports authorization holds, later capture, and transfers to driver accounts. Keeping authorization separate from capture lets the payment lifecycle follow the booking and trip lifecycle.']
};
function showArchitecture(key){const [h,p]=architectureCopy[key];document.getElementById('arch-explanation').innerHTML=`<h3>${h}</h3><p>${p}</p>`;document.querySelectorAll('[data-arch]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.arch===key)))}
document.querySelectorAll('[data-arch]').forEach(b=>b.addEventListener('click',()=>showArchitecture(b.dataset.arch)));showArchitecture('matching');
