import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(fileURLToPath(new URL('..', import.meta.url)));
const targets = ['js', 'css', 'assets/models'];
const files = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
for (const target of targets) await walk(join(project, target));

const records = [];
for (const path of files) {
  const info = await stat(path);
  const record = { file: relative(project, path).replaceAll('\\', '/'), bytes: info.size, type: extname(path).slice(1) || 'binary' };
  if (['.js', '.css'].includes(extname(path))) {
    const source = await readFile(path, 'utf8');
    record.meshConstructors = (source.match(/new THREE\.Mesh\s*\(/g) || []).length;
    record.pointClouds = (source.match(/new THREE\.Points\s*\(/g) || []).length;
    record.instancedMeshes = (source.match(/new THREE\.InstancedMesh\s*\(/g) || []).length;
    record.animationLoops = (source.match(/runtime\.start\s*\(/g) || []).length;
  }
  records.push(record);
}

const sum = (items, field) => items.reduce((total, item) => total + (item[field] || 0), 0);
const js = records.filter((item) => item.type === 'js');
const css = records.filter((item) => item.type === 'css');
const glb = records.filter((item) => item.type === 'glb');
const report = {
  version: '0.5.0',
  generatedAt: new Date().toISOString(),
  budgets: {
    javascriptBytes: 1200000,
    cssBytes: 420000,
    glbBytes: 1800000,
    largestModuleBytes: 180000,
    offlineCoreFiles: 110,
  },
  totals: {
    javascriptBytes: sum(js, 'bytes'),
    cssBytes: sum(css, 'bytes'),
    glbBytes: sum(glb, 'bytes'),
    meshConstructors: sum(js, 'meshConstructors'),
    pointClouds: sum(js, 'pointClouds'),
    instancedMeshes: sum(js, 'instancedMeshes'),
    animationLoops: sum(js, 'animationLoops'),
  },
  largestJavaScript: js.sort((a, b) => b.bytes - a.bytes).slice(0, 12),
  optimizationContracts: {
    sharedRuntime: 'js/render/runtime.js',
    performanceMonitor: 'js/render/performance-monitor.js',
    adaptiveOptimizer: 'js/render/adaptive-scene-optimizer.js',
    runtimeRegistry: 'js/render/runtime-registry.js',
    sceneSuspension: true,
    contextRecovery: true,
    dynamicResolution: true,
    pointsDrawRangeScaling: true,
    instancedMeshScaling: true,
    idleAssetPreload: true,
    explicitAssetRelease: true,
    scientificStateIndependentFromFps: true,
  },
  laboratoryContracts: [
    ['hall', 'js/modules/hall3d.js'],
    ['electricity', 'js/modules/ohm.js'],
    ['magnetism', 'js/modules/magnetism3d.js'],
    ['energy', 'js/modules/energy3d.js'],
    ['mechanics', 'js/modules/mechanics3d.js'],
    ['waves', 'js/modules/waves3d.js'],
    ['thermal', 'js/modules/thermal3d.js'],
    ['advanced', 'js/modules/advanced3d.js'],
  ].map(([name, scene]) => ({ name, scene, usesSharedRuntime: true, cleanupRequired: true })),
};
report.withinStaticBudget = {
  javascript: report.totals.javascriptBytes <= report.budgets.javascriptBytes,
  css: report.totals.cssBytes <= report.budgets.cssBytes,
  glb: report.totals.glbBytes <= report.budgets.glbBytes,
  largestModule: report.largestJavaScript[0]?.bytes <= report.budgets.largestModuleBytes,
};
await writeFile(join(project, 'assets/performance-budget.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Auditoria estática v${report.version}: ${Math.round(report.totals.javascriptBytes / 1024)} KiB JS, ${Math.round(report.totals.cssBytes / 1024)} KiB CSS, ${Math.round(report.totals.glbBytes / 1024)} KiB GLB.`);
