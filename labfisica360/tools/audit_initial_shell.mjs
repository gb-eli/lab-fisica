import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticImport = /(?:^|\n)\s*import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]\s*;?/g;
const initialStyles = [
  'css/styles.css','css/design-system.css','css/portal-home.css','css/student-session.css','css/pedagogy.css','css/stability-recovery.css',
];
const entries = ['js/app.js', 'js/modules/home.js'];
const modules = new Set();

function walkModule(path) {
  const absolute = resolve(root, path);
  const key = relative(root, absolute).replaceAll('\\', '/');
  if (modules.has(key)) return;
  modules.add(key);
  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(staticImport)) {
    const specifier = match[1];
    if (!specifier.startsWith('.')) continue;
    let dependency = resolve(dirname(absolute), specifier);
    if (!extname(dependency)) dependency += '.js';
    walkModule(relative(root, dependency));
  }
}
entries.forEach(walkModule);

function sizeOf(paths) { return paths.reduce((sum, path) => sum + statSync(resolve(root, path)).size, 0); }
function collect(dir, extension) {
  const out = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (path.endsWith(extension)) out.push(relative(root, path).replaceAll('\\', '/'));
    }
  }
  walk(resolve(root, dir));
  return out;
}
const allJs = collect('js', '.js');
const allCss = collect('css', '.css');
const allGlb = collect('assets', '.glb');
const moduleList = [...modules].sort();
const initialJsBytes = sizeOf(moduleList);
const initialCssBytes = sizeOf(initialStyles);
const report = {
  schemaVersion: 1,
  version: '0.5.0',
  generatedAt: new Date().toISOString(),
  strategy: 'static-import-closure-plus-selected-home-route',
  initial: {
    threeJs: false,
    glb: false,
    laboratoryModules: false,
    jsModules: moduleList.length,
    jsBytes: initialJsBytes,
    cssFiles: initialStyles.length,
    cssBytes: initialCssBytes,
    totalCodeBytes: initialJsBytes + initialCssBytes,
    modules: moduleList,
    styles: initialStyles,
  },
  project: {
    jsFiles: allJs.length,
    jsBytes: sizeOf(allJs),
    cssFiles: allCss.length,
    cssBytes: sizeOf(allCss),
    glbFiles: allGlb.length,
    glbBytes: sizeOf(allGlb),
  },
  ratios: {
    initialJsPercentOfProjectJs: Number((initialJsBytes / sizeOf(allJs) * 100).toFixed(2)),
    initialCssPercentOfProjectCss: Number((initialCssBytes / sizeOf(allCss) * 100).toFixed(2)),
  },
};
writeFileSync(resolve(root, 'validation/r8-initial-shell.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ initialJsKiB: (initialJsBytes/1024).toFixed(1), initialCssKiB: (initialCssBytes/1024).toFixed(1), modules: moduleList.length }));
