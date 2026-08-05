import { LAB_CATALOG } from './lab-catalog.js';

const LAB_COMMON_STYLES = Object.freeze([
  'css/experience-workspace.css',
  'css/artistic-refinement.css',
  'css/performance-validation.css',
]);

const definitions = {
  home: {
    kind: 'hub',
    title: 'Portal dos Laboratórios',
    styles: [],
    load: () => import('../modules/home.js'),
    render: 'renderHome',
  },
  roadmap: {
    kind: 'catalog',
    title: 'Catálogo de laboratórios',
    styles: [],
    load: () => import('../modules/roadmap.js'),
    render: 'renderRoadmap',
  },
  hall: {
    kind: 'orientation',
    title: 'Hall Científico 360',
    styles: [...LAB_COMMON_STYLES, 'css/hall-premium.css', 'css/r2-core-labs.css'],
    load: () => import('../modules/hall.js'),
    render: 'renderHall',
  },
  coulomb: {
    kind: 'lab',
    title: 'Eletrostática',
    styles: [...LAB_COMMON_STYLES, 'css/r2-core-labs.css'],
    load: () => import('../modules/coulomb.js'),
    render: 'renderCoulomb',
  },
  ohm: {
    kind: 'lab',
    title: 'Eletricidade',
    styles: [...LAB_COMMON_STYLES, 'css/electrical-bench.css', 'css/r2-core-labs.css'],
    load: () => import('../modules/ohm.js'),
    render: 'renderOhm',
  },
  magnetism: {
    kind: 'lab',
    title: 'Eletromagnetismo',
    styles: [...LAB_COMMON_STYLES, 'css/magnetism-lab.css', 'css/r3-reconstructed-labs.css'],
    load: () => import('../modules/magnetism.js'),
    render: 'renderMagnetism',
  },
  energy: {
    kind: 'lab',
    title: 'Energia',
    styles: [...LAB_COMMON_STYLES, 'css/energy-lab.css', 'css/r3-reconstructed-labs.css'],
    load: () => import('../modules/energy.js'),
    render: 'renderEnergy',
  },
  mechanics: {
    kind: 'lab',
    title: 'Mecânica',
    styles: [...LAB_COMMON_STYLES, 'css/mechanics-lab.css', 'css/r3-reconstructed-labs.css'],
    load: () => import('../modules/mechanics.js'),
    render: 'renderMechanics',
  },
  waves: {
    kind: 'lab',
    title: 'Ondas e Óptica',
    styles: [...LAB_COMMON_STYLES, 'css/waves-lab.css', 'css/r4-reconstructed-labs.css'],
    load: () => import('../modules/waves.js'),
    render: 'renderWaves',
  },
  thermal: {
    kind: 'lab',
    title: 'Termofluidos',
    styles: [...LAB_COMMON_STYLES, 'css/thermal-lab.css', 'css/r4-reconstructed-labs.css'],
    load: () => import('../modules/thermal.js'),
    render: 'renderThermal',
  },
  advanced: {
    kind: 'lab',
    title: 'Física Avançada',
    styles: [...LAB_COMMON_STYLES, 'css/advanced-lab.css', 'css/r4-reconstructed-labs.css'],
    load: () => import('../modules/advanced.js'),
    render: 'renderAdvanced',
  },
};

export const ROUTE_DEFINITIONS = Object.freeze(Object.fromEntries(
  Object.entries(definitions).map(([route, definition]) => [route, Object.freeze({ route, ...definition })]),
));

export const INITIAL_ROUTE = 'home';

export function getRouteDefinition(route) {
  return ROUTE_DEFINITIONS[route] || ROUTE_DEFINITIONS[INITIAL_ROUTE];
}

export function isLaboratoryRoute(route) {
  return getRouteDefinition(route).kind === 'lab';
}

export function buildModuleManifest() {
  return {
    version: 1,
    strategy: 'demand-loaded',
    initialRoute: INITIAL_ROUTE,
    initialHeavy3d: false,
    laboratories: LAB_CATALOG.map((lab) => ({
      route: lab.route,
      title: lab.shortTitle,
      estimatedMinutes: lab.estimatedMinutes,
      styles: getRouteDefinition(lab.route).styles,
    })),
    routes: Object.values(ROUTE_DEFINITIONS).map(({ load, ...route }) => route),
  };
}
