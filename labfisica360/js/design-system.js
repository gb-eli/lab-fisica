export const moduleThemes = {
  home: {
    kicker: 'Portal Científico',
    title: 'Laboratórios de Física',
    accent: '#66ddff',
    accentRgb: '102, 221, 255',
    secondary: '#70e6b5',
  },
  hall: {
    kicker: 'Centro de Pesquisa',
    title: 'Hall Científico 360',
    accent: '#58d9ff',
    accentRgb: '88, 217, 255',
    secondary: '#6f8cff',
  },
  coulomb: {
    kicker: 'Eletrostática',
    title: 'Coulomb, campo e potencial',
    accent: '#45dcff',
    accentRgb: '69, 220, 255',
    secondary: '#667cff',
  },
  ohm: {
    kicker: 'Eletrodinâmica',
    title: 'Corrente, resistência e potência',
    accent: '#ffc56a',
    accentRgb: '255, 197, 106',
    secondary: '#ff7b57',
  },
  magnetism: {
    kicker: 'Eletromagnetismo',
    title: 'Campos, indução e máquinas 360',
    accent: '#a887ff',
    accentRgb: '168, 135, 255',
    secondary: '#52dfff',
  },
  energy: {
    kicker: 'Energia e Instalações',
    title: 'Casa elétrica, microgeração e rede 360',
    accent: '#58e5a4',
    accentRgb: '88, 229, 164',
    secondary: '#55cfff',
  },
  mechanics: {
    kicker: 'Mecânica e Gravitação',
    title: 'Movimento, forças e dinâmica 360',
    accent: '#ff7188',
    accentRgb: '255, 113, 136',
    secondary: '#59bfff',
  },
  waves: {
    kicker: 'Ondas, Acústica e Luz',
    title: 'Som, ondas e óptica 360',
    accent: '#63dbff',
    accentRgb: '99, 219, 255',
    secondary: '#826fff',
  },
  thermal: {
    kicker: 'Termologia e Fluidos',
    title: 'Calor, gases e fluidos 360',
    accent: '#ff9b67',
    accentRgb: '255, 155, 103',
    secondary: '#62d9ff',
  },
  advanced: {
    kicker: 'Fronteira Científica',
    title: 'Física Avançada 360',
    accent: '#ff79d8',
    accentRgb: '255, 121, 216',
    secondary: '#836fff',
  },
  roadmap: {
    kicker: 'Arquitetura Modular',
    title: 'Plano de laboratórios',
    accent: '#76a7ff',
    accentRgb: '118, 167, 255',
    secondary: '#57e5ba',
  },
};

export function applyModuleTheme(routeName) {
  const name = moduleThemes[routeName] ? routeName : 'home';
  const theme = moduleThemes[name];
  document.documentElement.dataset.module = name;
  document.documentElement.style.setProperty('--module-accent', theme.accent);
  document.documentElement.style.setProperty('--module-accent-rgb', theme.accentRgb);
  document.documentElement.style.setProperty('--module-secondary', theme.secondary);
  const kicker = document.querySelector('#module-kicker');
  const title = document.querySelector('#module-title');
  if (kicker) kicker.textContent = theme.kicker;
  if (title) title.textContent = theme.title;
  document.title = `${theme.title} · Física Imersiva 360`;
  window.dispatchEvent(new CustomEvent('fisica:modulechange', { detail: { routeName: name, theme } }));
  return theme;
}

export function applyInterfaceSettings(settings) {
  const scale = Number(settings.uiScale || 100);
  document.documentElement.style.setProperty('--ui-scale', String(Math.min(125, Math.max(90, scale)) / 100));
  document.documentElement.dataset.density = settings.density || 'comfortable';
  document.body.classList.toggle('low-transparency', settings.lowTransparency === true);
}
