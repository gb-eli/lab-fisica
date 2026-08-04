import { readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = ['hall','coulomb','ohm','magnetism','energy','mechanics','waves','thermal','advanced'];
const count = (source, pattern) => (source.match(pattern) || []).length;
const files = {};
for (const name of modules) {
  const path = resolve(root, `js/modules/${name}.js`);
  const source = await readFile(path, 'utf8');
  const info = await stat(path);
  files[name] = {
    bytes: info.size,
    templateButtons: count(source, /<button\b/g),
    templateInputs: count(source, /<input\b/g),
    templateSelects: count(source, /<select\b/g),
    templateCards: count(source, /class="[^"]*(?:glass-card|control-card|sim-card|bench-card)[^"]*"/g),
    modeSelectors: count(source, /data-(?:mag|energy|mechanics|waves|thermal|advanced)-mode/g),
    threeMounts: count(source, /mount[A-Za-z0-9]+3D\(/g),
    asyncErrorHandlers: count(source, /\.catch\(/g),
  };
}
const total = Object.values(files).reduce((acc, item) => {
  for (const key of ['bytes','templateButtons','templateInputs','templateSelects','templateCards']) acc[key] += item[key];
  return acc;
}, { bytes:0, templateButtons:0, templateInputs:0, templateSelects:0, templateCards:0 });
const report = {
  version: '0.4.4',
  generatedAt: new Date().toISOString(),
  scope: 'Contagens estáticas nos templates-fonte; não representam necessariamente todos os elementos simultaneamente visíveis.',
  totals: total,
  modules: files,
  findings: [
    { priority:'P0', area:'3D e offline', issue:'O pacote local completo do Three.js ainda não está presente.', effect:'O primeiro carregamento 3D pode depender da rede; o modo 2D é obrigatório como recuperação.', status:'pending-external-runtime-bundle' },
    { priority:'P0', area:'Validação visual', issue:'O navegador automatizado do ambiente bloqueia a navegação local.', effect:'Sombras, sobreposições e gestos precisam de playtest em hardware real.', status:'pending-real-device-playtest' },
    { priority:'P1', area:'Arquitetura da informação', issue:'Metadados e objetivos eram duplicados em diferentes módulos.', effect:'Nomes e orientações podiam divergir.', status:'fixed-central-lab-catalog' },
    { priority:'P1', area:'Controles', issue:'Cada laboratório organizava controles e resultados de forma diferente.', effect:'Alta carga cognitiva e dificuldade para localizar ações.', status:'fixed-shared-experience-workspace' },
    { priority:'P1', area:'Bancada elétrica', issue:'Ferramentas avançadas disputavam atenção com o experimento principal.', effect:'O aluno podia manipular objetos antes de compreender o circuito.', status:'fixed-guided-progressive-disclosure' },
    { priority:'P1', area:'Mobile', issue:'Cena e painéis apareciam juntos em telas estreitas.', effect:'Pouca área útil para 3D e rolagem longa.', status:'fixed-scene-first-mobile-tabs' },
    { priority:'P2', area:'Cenários e objetos', issue:'A linguagem visual procedural ainda varia entre os laboratórios.', effect:'Qualidade e escala percebidas são inconsistentes.', status:'planned-lab-by-lab-art-pass' },
    { priority:'P2', area:'Lógica dos módulos', issue:'Alguns módulos concentram interface, estado, solver e renderização no mesmo arquivo.', effect:'Maior risco de regressão e manutenção difícil.', status:'planned-modular-decomposition' },
  ],
};
await writeFile(resolve(root, 'assets/ux-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
