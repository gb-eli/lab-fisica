import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(project, 'assets/models/electrical/manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(manifest.units, 'meters');
assert.equal(manifest.upAxis, 'Y');
assert.equal(manifest.forwardAxis, '-Z');
assert.equal(manifest.version, '1.2.0');
assert.equal(manifest.artGrade, 'premium-procedural-v2');
const required = ['workbench', 'power-supply', 'multimeter', 'resistor-module', 'toggle-switch', 'lamp-load', 'ammeter', 'voltmeter', 'fuse-module', 'rheostat', 'diode-module', 'led-module'];
let totalBytes = 0;
const interactionNames = new Set();
for (const id of required) {
  const asset = manifest.assets[id];
  assert.ok(asset, `Asset ausente: ${id}`);
  assert.equal(asset.lods.length, 3, `${id} precisa de três LODs.`);
  assert.ok(asset.collider, `${id} precisa de colisor.`);
  await access(resolve(project, asset.collider));
  for (const lod of asset.lods) {
    const path = resolve(project, lod.url);
    await access(path);
    const buffer = await readFile(path);
    assert.equal(buffer.readUInt32LE(0), 0x46546c67, `${lod.url} não é GLB.`);
    assert.equal(buffer.readUInt32LE(4), 2, `${lod.url} não é GLB 2.0.`);
    assert.equal(buffer.readUInt32LE(8), buffer.length, `${lod.url} possui tamanho inconsistente.`);
    assert.ok(buffer.length < 120_000, `${lod.url} excedeu o orçamento individual.`);
    if (lod.level === 0) {
      const jsonLength = buffer.readUInt32LE(12);
      const jsonType = buffer.readUInt32LE(16);
      assert.equal(jsonType, 0x4e4f534a);
      const gltf = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/g, '').trim());
      (gltf.nodes || []).forEach((node) => interactionNames.add(node.name));
      assert.ok((gltf.materials || []).every((material) => material.name?.startsWith('MAT_')), `${id} possui material sem contrato.`);
    }
    totalBytes += buffer.length;
  }
}
assert.ok(totalBytes < 1_400_000, 'O kit elétrico excedeu o orçamento total da fase.');
for (const name of ['PSU_WARNING_LABEL_MAT_WARNING', 'DMM_SCREEN_GLASS_MAT_SCREEN_GLASS', 'RHEO_SCALE_LABEL_MAT_LABEL', 'LED_ANODE_LABEL_MAT_RED', 'KNOB_VOLTAGE_MAT_POLYMER_BLACK', 'KNOB_CURRENT_MAT_POLYMER_BLACK', 'DMM_DIAL_MAT_POLYMER_BLACK', 'SW_LEVER_MAT_METAL_BRUSHED', 'LAMP_BULB_MAT_GLASS', 'RES_BODY_MAT_CERAMIC', 'FUSE_WIRE_MAT_METAL_COPPER', 'RHEO_SLIDER_MAT_ORANGE', 'LED_LENS_MAT_GLASS']) {
  assert.ok(interactionNames.has(name), `Nó interativo ausente: ${name}`);
}
for (const texture of Object.values(manifest.textures)) {
  for (const key of ['baseColor', 'roughness', 'normal']) {
    await access(resolve(project, texture[key]));
    assert.ok((await stat(resolve(project, texture[key]))).size < 250_000);
  }
}
const loader = await readFile(resolve(project, 'js/assets/glb-loader-lite.js'), 'utf8');
assert.match(loader, /GLB_MAGIC/);
assert.match(loader, /computeVertexNormals/);
const manager = await readFile(resolve(project, 'js/assets/asset-manager.js'), 'utf8');
assert.match(manager, /class AssetManager/);
assert.match(manager, /selectLod/);
assert.match(manager, /createAssetFallback/);
const ohm = await readFile(resolve(project, 'js/modules/ohm.js'), 'utf8');
assert.match(ohm, /createBenchScene/);
assert.match(ohm, /AssetManager/);
assert.match(ohm, /ConnectionManager/);
assert.match(await readFile(resolve(project, 'js/render/cables.js'), 'utf8'), /createDynamicCableSystem/);
assert.match(ohm, /Inspeção 360/);
console.log(`✓ Pipeline 3D validado: ${required.length} assets, ${required.length * 3} GLBs, ${(totalBytes / 1024).toFixed(1)} KiB.`);
