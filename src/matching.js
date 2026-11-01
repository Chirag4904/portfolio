export const initialPassengers = [
  {id:1,x:180,y:240}, {id:2,x:390,y:100}, {id:3,x:550,y:210}
];

// This educational score measures proximity to a drawn route, not production ride suitability.
export function rankPickups(passengers, route) {
  if(route.length < 2) throw new RangeError('A route needs at least two points.');
  return passengers.map(passenger => {
    let nearest = {distance:Infinity,x:0,y:0};
    for(let i=1;i<route.length;i++) {
      const a=route[i-1], b=route[i];
      const dx=b.x-a.x, dy=b.y-a.y;
      const lengthSquared=dx*dx+dy*dy;
      const t=lengthSquared ? Math.max(0,Math.min(1,((passenger.x-a.x)*dx+(passenger.y-a.y)*dy)/lengthSquared)) : 0;
      const x=a.x+t*dx, y=a.y+t*dy;
      const distance=Math.hypot(passenger.x-x,passenger.y-y);
      if(distance<nearest.distance) nearest={distance,x,y};
    }
    return {...passenger,nearest,distance:nearest.distance};
  }).sort((a,b)=>a.distance-b.distance || a.id-b.id);
}
