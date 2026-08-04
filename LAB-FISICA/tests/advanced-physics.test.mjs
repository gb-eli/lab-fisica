import assert from 'node:assert/strict';
import {
  C, SOLAR_MASS, lorentzFactor, deBroglieWavelength, gaussianWavePacket,
  tunnelingTransmission, doubleSlitIntensity, timeDilation, lengthContraction,
  relativisticJourney, schwarzschildRadius, gravitationalTimeDilation,
  gravitationalDeflection, blackHoleProperties, galaxyRotationCurve, spacetimeInterval,
} from '../js/science/advanced-physics.js';

const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t,`${a} ≠ ${b}`);
close(lorentzFactor({beta:.8}),5/3,1e-12);
close(timeDilation({coordinateTime:10,beta:.8}).properTime,6,1e-12);
close(lengthContraction({properLength:100,beta:.8}).contractedLength,60,1e-10);
const journey=relativisticJourney({distanceLy:4,beta:.8});close(journey.earthYears,5);close(journey.travelerYears,3);
const db=deBroglieWavelength({speed:C*.01});assert.ok(db.wavelength>0&&db.wavelength<1e-8);
const packet=gaussianWavePacket({x:0,sigma:1});assert.ok(packet.probabilityDensity>0);
const low=tunnelingTransmission({energyEv:4,barrierEv:8,widthNm:.3});
const wide=tunnelingTransmission({energyEv:4,barrierEv:8,widthNm:.9});assert.ok(low.transmission>wide.transmission);
assert.ok(doubleSlitIntensity({angleRad:0})>.999);
const rs=schwarzschildRadius({massKg:SOLAR_MASS});assert.ok(Math.abs(rs-2953)<5);
const clock=gravitationalTimeDilation({solarMasses:10,radiusInRs:6});assert.ok(clock.factor>0&&clock.factor<1);
const bend=gravitationalDeflection({solarMasses:1,impactParameterM:6.957e8});assert.ok(Math.abs(bend.angleArcseconds-1.75)<.05);
const bh=blackHoleProperties({solarMasses:10,orbitRadiusRs:6});assert.ok(bh.iscoRadius===3*bh.schwarzschildRadius);assert.ok(bh.orbitalPeriod>0);
const curve=galaxyRotationCurve({radiusKpc:20,diskMassSolar:6e10,haloVelocityKmS:190});assert.ok(curve.totalVelocity>curve.luminousVelocity);assert.ok(curve.haloFraction>0);
assert.equal(spacetimeInterval({deltaTimeNs:10,deltaX:1}).classification,'timelike');
assert.equal(spacetimeInterval({deltaTimeNs:1,deltaX:1}).classification,'spacelike');
assert.equal(spacetimeInterval({deltaTimeNs:10,deltaX:C*10e-9}).classification,'lightlike');
console.log('✓ Física Avançada: quântica, relatividade, buracos negros, matéria escura e causalidade validadas.');
