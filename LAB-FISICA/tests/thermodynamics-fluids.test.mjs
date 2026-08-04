import assert from 'node:assert/strict';
import {
  celsiusToKelvin, sensibleHeat, calorimetryEquilibrium, latentHeat, linearExpansion,
  conduction, convection, radiation, phaseChangeWater, idealGasState, gasProcess,
  hydrostaticPressure, buoyancy, continuity, bernoulli, torricelli, reynoldsNumber,
  poiseuilleFlow, heatEngine, refrigerator,
} from '../js/science/thermodynamics-fluids.js';
const close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} ≠ ${b}`);
close(celsiusToKelvin(0),273.15);
close(sensibleHeat({mass:2,specificHeat:1000,initialTemperature:20,finalTemperature:30}).heat,20000);
const eq=calorimetryEquilibrium({bodies:[{mass:1,specificHeat:1000,temperature:20},{mass:1,specificHeat:1000,temperature:80}]});close(eq.equilibriumTemperature,50);close(eq.energyBalance,0);
close(latentHeat({mass:2,latentHeat:100}).heat,200);
close(linearExpansion({initialLength:2,coefficient:10e-6,deltaTemperature:50}).deltaLength,.001);
close(conduction({conductivity:2,area:3,hotTemperature:40,coldTemperature:20,thickness:.5}).heatRate,240);
close(convection({coefficient:10,area:2,surfaceTemperature:50,fluidTemperature:20}).heatRate,600);
assert.ok(radiation({emissivity:1,area:1,surfaceTemperatureC:100,surroundingsTemperatureC:20}).heatRate>0);
const melt=phaseChangeWater({mass:1,initialTemperature:0,suppliedHeat:167000});close(melt.solidFraction,.5,1e-8);close(melt.liquidFraction,.5,1e-8);
const gas=idealGasState({moles:1,temperatureC:0,volume:.022414});assert.ok(Math.abs(gas.pressure-101325)<500);
const iso=gasProcess({type:'isothermal',initialPressure:100000,initialVolume:.02,finalVolume:.01});close(iso.finalPressure,200000);
close(hydrostaticPressure({density:1000,depth:2,atmosphericPressure:0,gravity:10}).gaugePressure,20000);
const float=buoyancy({fluidDensity:1000,displacedVolume:.001,objectMass:.5,gravity:10});close(float.buoyantForce,10);close(float.weight,5);assert.equal(float.state,'rising');
close(continuity({area1:.02,velocity1:2,area2:.01}).velocity2,4);
const b=bernoulli({pressure1:100000,velocity1:1,height1:0,velocity2:3,height2:0,density:1000,gravity:10});close(b.pressure2,96000);
close(torricelli({depth:5,gravity:10}).velocity,10);
assert.equal(reynoldsNumber({density:1000,velocity:.01,diameter:.01,viscosity:.001}).regime,'laminar');
assert.ok(poiseuilleFlow({pressureDrop:1000,radius:.005,length:1,viscosity:.001}).flowRate>0);
const engine=heatEngine({hotTemperatureC:500,coldTemperatureC:30,heatInput:1000});assert.ok(engine.work>0);assert.ok(engine.efficiency<=engine.carnotEfficiency);
const fridge=refrigerator({coldTemperatureC:4,hotTemperatureC:30,workInput:100});assert.ok(fridge.removedHeat>0);assert.ok(fridge.cop<=fridge.carnotCop);
console.log('✓ Termologia, gases e fluidos: calorimetria, transferência, fases, gases, hidrostática, Bernoulli e máquinas térmicas validados.');
