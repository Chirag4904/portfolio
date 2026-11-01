import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rankPickups} from '../src/matching.js';

test('ranks shortest segment distances, including between sample points',()=>{
 const route=[{x:0,y:0},{x:100,y:0}];
 const ranked=rankPickups([{id:1,x:50,y:30},{id:2,x:51,y:0},{id:3,x:40,y:10}],route);
 assert.deepEqual(ranked.map(p=>p.id),[2,3,1]);
 assert.equal(ranked[0].distance,0);
 assert.deepEqual(ranked[0].nearest,{distance:0,x:51,y:0});
});
test('moving a passenger changes the ranking without mutating the input',()=>{
 const passengers=[{id:1,x:20,y:10},{id:2,x:30,y:50}];
 const route=[{x:0,y:0},{x:100,y:0}];
 assert.equal(rankPickups(passengers,route)[0].id,1);
 const moved=passengers.map(p=>p.id===2?{...p,y:1}:p);
 assert.equal(rankPickups(moved,route)[0].id,2);
 assert.equal(passengers[1].y,50);
});
test('clamps to endpoints, handles repeated points, and resolves equal distances predictably',()=>{
 const route=[{x:0,y:0},{x:0,y:0},{x:10,y:0}];
 const ranked=rankPickups([{id:3,x:15,y:0},{id:1,x:-5,y:0},{id:2,x:5,y:5}],route);
 assert.deepEqual(ranked.map(p=>p.id),[1,2,3]);
 assert.ok(ranked.every(p=>p.distance===5));
 assert.deepEqual(rankPickups([],route),[]);
 assert.throws(()=>rankPickups([],[]),RangeError);
});
