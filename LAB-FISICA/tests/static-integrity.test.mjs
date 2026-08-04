import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'index.html', 'css/styles.css', 'css/design-system.css', 'css/electrical-bench.css', 'css/hall-premium.css', 'css/magnetism-lab.css', 'css/energy-lab.css', 'css/mechanics-lab.css', 'css/waves-lab.css', 'css/advanced-lab.css', 'css/experience-workspace.css', 'js/app.js', 'js/labs/lab-catalog.js', 'js/ui/experience-workspace.js',
  'js/design-system.js', 'js/ui/icons.js', 'js/modules/advanced.js', 'js/modules/ohm.js',
  'js/modules/advanced3d.js', 'js/modules/hall.js', 'js/modules/hall3d.js', 'js/modules/hall-audio.js', 'js/modules/hall-vignettes.js',
  'sw.js', 'manifest.webmanifest', 'assets/manifest.json', 'assets/graphics-standard.json',
  'assets/models/electrical/manifest.json', 'assets/models/electrical/asset-checksums.json', 'docs/PIPELINE_ASSETS_3D.md', 'docs/CATALOGO_ASSETS_ELETRICOS.md',
  'docs/HALL_CIENTIFICO_360_PREMIUM.md', 'docs/RELATORIO_VALIDACAO_V0.2.6.md',
  'docs/PLANO_EVOLUCAO_VISUAL_360.md', 'docs/PADRAO_GRAFICO_OBRIGATORIO.md',
  'docs/DESIGN_SYSTEM_CIENTIFICO.md', 'docs/NUCLEO_RENDERIZACAO_PREMIUM.md',
  'js/render/runtime.js', 'js/render/three-loader.js', 'js/render/webgl-preflight.js', 'js/render/render-watchdog.js', 'js/assets/asset-manager.js', 'js/assets/glb-loader-lite.js',
  'js/interaction/command-history.js', 'js/interaction/snap-system.js', 'js/interaction/transform-gizmo.js', 'js/interaction/connection-manager.js', 'js/interaction/interaction-manager.js',
  'docs/SISTEMA_UNIVERSAL_INTERACAO.md', 'docs/RELATORIO_VALIDACAO_V0.2.7.md',
  'js/science/electrical-instruments.js', 'docs/INSTRUMENTOS_COMPONENTES_REALISTAS.md', 'docs/RELATORIO_VALIDACAO_V0.2.8.md',
  'js/science/resistive-network.js', 'docs/LABORATORIO_ELETRICIDADE_PREMIUM.md', 'docs/RELATORIO_VALIDACAO_V0.2.9.md',
  'js/science/electromagnetism.js', 'js/modules/magnetism.js', 'js/modules/magnetism3d.js', 'docs/ELETROMAGNETISMO_ENERGIA_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.0.md',
  'js/science/energy-grid.js', 'js/modules/energy.js', 'js/modules/energy3d.js', 'docs/ENERGIA_CASA_REDE_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.1.md',
  'js/science/mechanics.js', 'js/modules/mechanics.js', 'js/modules/mechanics3d.js', 'docs/MECANICA_GRAVIDADE_DINAMICA_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.2.md',
  'js/science/waves-optics.js', 'js/modules/waves.js', 'js/modules/waves3d.js', 'docs/ONDAS_SOM_OPTICA_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.3.md',
  'js/science/thermodynamics-fluids.js', 'js/modules/thermal.js', 'js/modules/thermal3d.js', 'css/thermal-lab.css', 'docs/TERMOLOGIA_GASES_FLUIDOS_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.4.md',
  'js/science/advanced-physics.js', 'css/advanced-lab.css', 'docs/FISICA_AVANCADA_PREMIUM_360.md', 'docs/RELATORIO_VALIDACAO_V0.3.5.md',
  'js/render/adaptive-scene-optimizer.js', 'js/render/runtime-registry.js', 'css/performance-validation.css', 'assets/performance-budget.json',
  'docs/OTIMIZACAO_VALIDACAO_TRANSVERSAL.md', 'docs/RELATORIO_VALIDACAO_V0.3.6.md',
  'js/render/artistic-refinement.js', 'js/device-validation.js', 'css/artistic-refinement.css', 'css/device-validation.css',
  'docs/REFINAMENTO_ARTISTICO_VALIDACAO_REAL.md', 'docs/MATRIZ_VALIDACAO_DISPOSITIVOS.md', 'docs/RELATORIO_VALIDACAO_V0.3.7.md',
  'js/pedagogy/guided-learning.js', 'js/pedagogy/usage-validation.js', 'css/pedagogy.css', 'assets/pedagogy-standard.json',
  'docs/VALIDACAO_USO_ACESSIBILIDADE_PEDAGOGICA.md', 'docs/ROTEIROS_PEDAGOGICOS_LABORATORIOS.md', 'docs/RELATORIO_VALIDACAO_V0.3.8.md',
  'js/stability.js', 'css/stability-recovery.css', 'docs/AUDITORIA_RECUPERACAO_ESTRUTURAL_V0.3.9.md', 'docs/RELATORIO_VALIDACAO_V0.3.9.md',
  'js/labs/lab-catalog.js', 'js/ui/experience-workspace.js', 'css/experience-workspace.css', 'assets/ux-audit.json',
  'docs/AUDITORIA_UX_UI_GRAFICOS_LOGICA_V0.4.0.md', 'docs/PLANO_RECONSTRUCAO_LABORATORIOS.md', 'docs/MAPA_BANCADAS_CENARIOS_V0.4.0.md', 'docs/RECONSTRUCAO_R3_ELETROMAGNETISMO_ENERGIA_MECANICA.md', 'docs/RELATORIO_VALIDACAO_V0.4.2.md', 'js/ui/r4-guided-labs.js', 'css/r4-reconstructed-labs.css', 'assets/r4-core-labs.json', 'docs/RECONSTRUCAO_R4_ONDAS_TERMOFLUIDOS_FISICA_AVANCADA.md', 'docs/RELATORIO_VALIDACAO_V0.4.4.md',
];
await Promise.all(files.map((file) => access(resolve(project, file))));

const app = await readFile(resolve(project, 'js/app.js'), 'utf8');
assert.match(app, /advanced:\s*\(/, 'A rota advanced precisa estar registrada.');
assert.match(app, /magnetism:\s*\(/, 'A rota magnetism precisa estar registrada.');
assert.match(app, /energy:\s*\(/, 'A rota energy precisa estar registrada.');
assert.match(app, /mechanics:\s*\(/, 'A rota mechanics precisa estar registrada.');
assert.match(app, /waves:\s*\(/, 'A rota waves precisa estar registrada.');
assert.match(app, /thermal:\s*\(/, 'A rota thermal precisa estar registrada.');
assert.match(app, /renderAdvanced/, 'O módulo advanced precisa ser importado.');
assert.match(app, /renderOhm\(root, \{ getSettings/, 'A bancada 3D precisa receber configurações gráficas.');
assert.match(app, /applyModuleTheme/, 'Os temas de módulo precisam ser aplicados.');
assert.match(app, /applyInterfaceSettings/, 'As configurações visuais precisam ser aplicadas.');
assert.match(app, /GuidedLearningController/, 'A aprendizagem guiada precisa estar integrada ao app.');
assert.match(app, /pedagogy\.attachRoute/, 'O roteiro precisa acompanhar a rota ativa.');

const index = await readFile(resolve(project, 'index.html'), 'utf8');
assert.match(app, /advanced:\s*\(/, 'A navegação precisa expor a aba avançada.');
assert.match(app, /magnetism:\s*\(/, 'A rota magnetism precisa permanecer registrada.');
assert.match(app, /energy:\s*\(/, 'A rota energy precisa permanecer registrada.');
assert.match(app, /mechanics:\s*\(/, 'A rota mechanics precisa permanecer registrada.');
assert.match(app, /waves:\s*\(/, 'A rota waves precisa permanecer registrada.');
assert.match(app, /thermal:\s*\(/, 'A rota thermal precisa permanecer registrada.');
assert.match(index, /css\/design-system\.css/);
assert.match(index, /css\/electrical-bench\.css/);
assert.match(index, /css\/hall-premium\.css/);
assert.match(index, /css\/magnetism-lab\.css/);
assert.match(index, /css\/energy-lab\.css/);
assert.match(index, /css\/mechanics-lab\.css/);
assert.match(index, /css\/waves-lab\.css/);
assert.match(index, /css\/thermal-lab\.css/);
assert.match(index, /css\/advanced-lab\.css/);
assert.match(index, /css\/performance-validation\.css/);
assert.match(index, /css\/artistic-refinement\.css/);
assert.match(index, /css\/device-validation\.css/);
assert.match(index, /css\/pedagogy\.css/);
assert.match(index, /css\/stability-recovery\.css/);
assert.match(index, /css\/r4-reconstructed-labs\.css/);
assert.match(index, /id="force-2d"/);
assert.match(index, /id="btn-progress"/);
assert.match(index, /id="simplified-instructions"/);
assert.match(index, /id="large-touch-targets"/);
assert.match(index, /id="strong-focus"/);
assert.match(index, /id="persistent-labels"/);
assert.match(index, /id="adaptive-quality"/);
assert.match(index, /id="pause-hidden-scenes"/);
assert.match(index, /id="webgl-recovery"/);
assert.match(index, /id="surface-detail"/);
assert.match(index, /id="inspection-lighting"/);
assert.match(index, /id="camera-assist"/);
assert.match(index, /id="run-device-validation"/);

const hall = await readFile(resolve(project, 'js/modules/hall.js'), 'utf8');
const catalog = await readFile(resolve(project, 'js/labs/lab-catalog.js'), 'utf8');
assert.match(catalog, /route: 'advanced'/);
assert.match(hall, /Versão 0\.4\.5/);
assert.match(catalog, /route: 'magnetism'/);
assert.match(catalog, /route: 'energy'/);
assert.match(catalog, /route: 'mechanics'/);
assert.match(catalog, /route: 'waves'/);
assert.match(catalog, /route: 'thermal'/);
assert.match(hall, /Hall Científico 360/);

const sw = await readFile(resolve(project, 'sw.js'), 'utf8');
assert.match(sw, /asset-manager\.js/);
assert.match(sw, /workbench_lod2\.glb/);
assert.match(sw, /electrical-bench\.css/);
assert.match(sw, /hall-premium\.css/);
assert.match(sw, /hall-audio\.js/);
assert.match(sw, /hall-vignettes\.js/);
assert.match(sw, /v0\.4\.5/);
assert.match(sw, /guided-learning\.js/);
assert.match(sw, /usage-validation\.js/);
assert.match(sw, /pedagogy\.css/);
assert.match(sw, /pedagogy-standard\.json/);
assert.match(sw, /artistic-refinement\.js/);
assert.match(sw, /device-validation\.js/);
assert.match(sw, /resistive-network\.js/);
assert.match(sw, /electromagnetism\.js/);
assert.match(sw, /magnetism3d\.js/);
assert.match(sw, /energy-grid\.js/);
assert.match(sw, /energy3d\.js/);
assert.match(sw, /mechanics\.js/);
assert.match(sw, /mechanics3d\.js/);
assert.match(sw, /waves-optics\.js/);
assert.match(sw, /waves3d\.js/);
assert.match(sw, /thermodynamics-fluids\.js/);
assert.match(sw, /thermal3d\.js/);
assert.match(sw, /advanced-physics\.js/);
assert.match(sw, /advanced-lab\.css/);
assert.match(sw, /adaptive-scene-optimizer\.js/);
assert.match(sw, /runtime-registry\.js/);
assert.match(sw, /performance-budget\.json/);
assert.match(sw, /stability\.js/);
assert.match(sw, /stability-recovery\.css/);
assert.match(sw, /experience-workspace\.css/);
assert.match(sw, /lab-catalog\.js/);
assert.match(sw, /experience-workspace\.js/);
assert.match(sw, /ux-audit\.json/);
assert.match(sw, /r4-guided-labs\.js/);
assert.match(sw, /r4-reconstructed-labs\.css/);
assert.match(sw, /r4-core-labs\.json/);

const manifest = JSON.parse(await readFile(resolve(project, 'assets/manifest.json'), 'utf8'));
assert.equal(manifest.version, '0.4.5');
assert.equal(manifest.groups['advanced-frontier'].topics.includes('advanced-chemistry'), false);
assert.equal(manifest.groups['visual-standard'].status, 'phase-r6-webgl-pilot-v0.4.5');
assert.equal(manifest.groups['asset-pipeline'].status, 'functional-premium-procedural-v2');
assert.equal(manifest.groups.circuits.status, 'functional-premium-electricity-lab');
assert.equal(manifest.groups.hall.status, 'functional-premium-hall');
assert.equal(manifest.groups.magnetism.status, 'functional-premium-electromagnetism-lab');
assert.equal(manifest.groups.energy.status, 'functional-premium-energy-house-grid-lab');
assert.equal(manifest.groups.mechanics.status, 'functional-premium-mechanics-gravity-lab');
assert.equal(manifest.groups.waves.status, 'functional-premium-waves-sound-optics-lab');
assert.equal(manifest.groups.thermal.status, 'functional-premium-thermology-gases-fluids-lab');
assert.equal(manifest.groups['advanced-frontier'].status, 'functional-premium-advanced-physics-lab');
assert.equal(manifest.groups['advanced-frontier'].scienceEngine, 'js/science/advanced-physics.js');

assert.equal(manifest.groups['interaction-system'].status, 'functional-reference-implementation');
assert.equal(manifest.groups['render-core'].adaptiveOptimizer, 'js/render/adaptive-scene-optimizer.js');
assert.equal(manifest.groups['render-core'].performanceBudget, 'assets/performance-budget.json');
assert.equal(manifest.groups['render-core'].artisticRefinement, 'js/render/artistic-refinement.js');
assert.equal(manifest.groups['device-validation'].status, 'functional-local-matrix');
assert.equal(manifest.groups['pedagogy-accessibility'].status, 'functional-local-guided-learning');
assert.equal(manifest.groups['pedagogy-accessibility'].routes, 10);
assert.equal(manifest.groups['pedagogy-accessibility'].checkpointsPerRoute, 4);
assert.equal(manifest.groups['stability-recovery'].status, 'functional-recovery-layer');
assert.equal(manifest.groups['ux-ui-reorganization'].status, 'functional-shared-workspace');
assert.equal(manifest.groups['ux-ui-reorganization'].routes, 8);
assert.equal(manifest.groups['r4-reconstruction'].status, 'functional-guided-reconstruction');

assert.equal(manifest.groups.circuits.equipment.length, 11);
assert.equal(manifest.groups.circuits.scienceEngine, 'js/science/resistive-network.js');
assert.equal(manifest.groups.circuits.instrumentEngine, 'js/science/electrical-instruments.js');
console.log('✓ Integridade estática, versão, rotas, Hall, laboratórios, aprendizagem guiada e acessibilidade validados.');
