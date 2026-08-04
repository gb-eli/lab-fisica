import assert from 'node:assert/strict';
import {
  waveRelations, harmonicWave, resultantAmplitude, twoSourceInterference, diffractionFactor,
  stringMode, openTubeFrequency, closedTubeFrequency, soundSpeedAir, soundIntensity, echoDistance,
  sabineReverberation, dopplerFrequency, beatFrequency, reflectVector2D, snellRefraction,
  thinLens, criticalAngle, fiberGuidance, doubleSlit, wavelengthToRgb, prismIndex,
} from '../js/science/waves-optics.js';
const close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} ≠ ${b}`);
const relation=waveRelations({frequency:5,speed:20}); close(relation.wavelength,4);close(relation.period,.2);
close(harmonicWave({x:0,time:0,amplitude:2,frequency:1,speed:2,phase:Math.PI/2}).displacement,2);
close(resultantAmplitude({amplitude1:1,amplitude2:1,phaseDifference:0}),2);
close(resultantAmplitude({amplitude1:1,amplitude2:1,phaseDifference:Math.PI}),0,1e-7);
const interference=twoSourceInterference({x:0,z:2,time:0,amplitude:1,frequency:1,speed:2,sourceSeparation:2});close(interference.pathDifference,0);
close(diffractionFactor({wavelength:1,slitWidth:1,angleDeg:0}),1);
const string=stringMode({length:2,tension:100,linearDensity:.01,harmonic:2});close(string.speed,100);close(string.frequency,50);assert.equal(string.nodes.length,3);
close(openTubeFrequency({length:1,speed:340,harmonic:1}),170);
close(closedTubeFrequency({length:1,speed:340,mode:1}),85);
close(soundSpeedAir({temperatureC:20}),343.42,1e-9);
const intensity=soundIntensity({power:4*Math.PI,distance:2});close(intensity.intensity,.25);
close(echoDistance({delay:.2,speed:340}),34);
close(sabineReverberation({volume:100,absorptionArea:20}),.805);
const doppler=dopplerFrequency({sourceFrequency:500,waveSpeed:340,sourceVelocity:34,observerVelocity:0});close(doppler.observedFrequency,500*340/306);
close(beatFrequency(440,444),4);
const reflected=reflectVector2D({direction:[1,-1],normal:[0,1]});close(reflected[0],1);close(reflected[1],1);
const snell=snellRefraction({n1:1,n2:1.5,incidentAngleDeg:30});close(snell.refractedAngleDeg,19.47122063449069,1e-8);
assert.equal(snellRefraction({n1:1.5,n2:1,incidentAngleDeg:60}).totalInternalReflection,true);
const lens=thinLens({focalLength:1,objectDistance:2,objectHeight:1});close(lens.imageDistance,2);close(lens.magnification,-1);
close(criticalAngle({n1:1.5,n2:1}),41.810314895778596,1e-8);
const fiber=fiberGuidance({coreIndex:1.48,claddingIndex:1.46,entryAngleDeg:5});assert.ok(fiber.numericalAperture>0);assert.equal(fiber.guided,true);
const slit=doubleSlit({wavelengthNm:500,slitSeparationMm:.5,screenDistanceM:2,slitWidthMm:.1});close(slit.fringeSpacing,.002);close(slit.centralEnvelopeWidth,.02);
const rgb=wavelengthToRgb(550);assert.equal(rgb.length,3);assert.ok(rgb[1]>rgb[0]);
assert.ok(prismIndex({wavelengthNm:450})>prismIndex({wavelengthNm:650}));
console.log('✓ Ondas, acústica e óptica: relações, ressonância, Doppler, lentes, refração, fibra e interferência validados.');
