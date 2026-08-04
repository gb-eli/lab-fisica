import assert from 'node:assert/strict';
import {
  linearMotion, freeFallState, inclineState, projectileFlight, collision1D,
  springMassState, pendulumState, circularOrbit, CELESTIAL_GRAVITY,
} from '../js/science/mechanics.js';

const close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} ≠ ${b}`);
const motion=linearMotion({velocity0:2,acceleration:3,time:4});
close(motion.position,32); close(motion.velocity,14);
const fall=freeFallState({height:20,gravity:10,time:2}); close(fall.height,0); close(fall.impactSpeed,20);
const incline=inclineState({mass:2,angleDeg:30,gravity:10,muStatic:0,muKinetic:0}); close(incline.acceleration,5);
const projectile=projectileFlight({speed:20,angleDeg:45,height:0,gravity:10,dragCoefficient:0}); close(projectile.range,40,0.05); close(projectile.maximumHeight,10,0.05);
const elastic=collision1D({mass1:1,mass2:1,velocity1:3,velocity2:0,restitution:1}); close(elastic.velocity1,0); close(elastic.velocity2,3); close(elastic.momentumBefore,elastic.momentumAfter);
const inelastic=collision1D({mass1:1,mass2:1,velocity1:3,velocity2:0,restitution:0}); close(inelastic.velocity1,1.5); close(inelastic.velocity2,1.5);
const spring=springMassState({mass:1,springConstant:4,damping:0,amplitude:1,time:0}); close(spring.position,1); close(spring.period,Math.PI);
const pendulum=pendulumState({length:1,gravity:Math.PI*Math.PI*4,angleDeg:10,time:0}); close(pendulum.period,1);
const orbit=circularOrbit({radius:1,centralMass:1,gravitationalConstant:1}); close(orbit.velocity,1); close(orbit.period,2*Math.PI);
assert.ok(CELESTIAL_GRAVITY.moon<CELESTIAL_GRAVITY.earth);
console.log('✓ Mecânica: cinemática, queda, rampa, projétil, colisões, osciladores e órbita validados.');
