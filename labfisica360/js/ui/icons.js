const ICONS = {
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  hall: '<path d="M4 20V8l8-4 8 4v12"/><path d="M8 20v-7h8v7"/><path d="M2 20h20"/>',
  coulomb: '<circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="3.8" ry="9" transform="rotate(42 12 12)"/><circle cx="19.5" cy="10" r="1" fill="currentColor" stroke="none"/>',
  ohm: '<path d="M3 12h3l1.5-4 3 8 3-8 3 8 1.5-4H21"/><path d="M3 6v12M21 6v12"/>',
  magnet: '<path d="M5 4v8a7 7 0 0 0 14 0V4h-5v8a2 2 0 0 1-4 0V4Z"/><path d="M5 8h5M14 8h5"/>',
  coil: '<path d="M4 8c2.5-3 5 3 7.5 0s5 3 8.5 0M4 16c2.5-3 5 3 7.5 0s5 3 8.5 0"/><path d="M4 8v8M20 8v8"/>',
  induction: '<path d="M5 12h14"/><path d="m15 8 4 4-4 4"/><path d="M8 5c-3 2-3 12 0 14M11 5c-3 2-3 12 0 14"/>',
  motor: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/>',
  generator: '<circle cx="12" cy="12" r="8"/><path d="M7 12c1.5-4 3.5 4 5 0s3.5 4 5 0"/>',
  transformer: '<path d="M4 5h5v14H4M20 5h-5v14h5"/><path d="M10 7c2-2 2 4 4 2M10 11c2-2 2 4 4 2M10 15c2-2 2 4 4 2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15 7-2 6-6 2 2-6Z"/>',
  energy: '<path d="M13 2 5 13h6l-1 9 9-13h-6Z"/>',
  wave: '<path d="M2 12c2.2-5 4.5 5 6.8 0s4.5-5 6.8 0 4.5 5 6.4 0"/><path d="M2 17c2.2-3 4.5 3 6.8 0s4.5-3 6.8 0 4.5 3 6.4 0"/>',
  resonance: '<path d="M3 12h3M18 12h3"/><path d="M6 7c2-3 4 3 6 0s4 3 6 0M6 17c2-3 4 3 6 0s4 3 6 0"/>',
  doppler: '<circle cx="7" cy="12" r="2"/><path d="M11 7a7 7 0 0 1 0 10M14 4a11 11 0 0 1 0 16"/><path d="m4 5-2 2 2 2M4 15l-2 2 2 2"/>',
  lens: '<path d="M9 3c3 4 3 14 0 18M15 3c-3 4-3 14 0 18"/><path d="M3 12h18"/>',
  prism: '<path d="m12 3 9 17H3Z"/><path d="M2 10h7M15 10l7-3M15 12l7 1M15 14l6 5"/>',

  thermal: '<path d="M10 5a2 2 0 0 1 4 0v8.2a4.5 4.5 0 1 1-4 0Z"/><path d="M12 7v9"/><path d="M17 6c2 1 2 3 0 4M19 3c4 2 4 7 0 9"/>',
  'heat-transfer': '<path d="M3 12h18M16 7l5 5-5 5M8 7l-5 5 5 5"/><path d="M10 4c1-2 3-2 4 0s3 2 4 0"/>',
  gas: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M7 9h10M8 6h8"/><circle cx="9" cy="14" r="1"/><circle cx="14" cy="16" r="1"/><circle cx="16" cy="12" r="1"/>',
  buoyancy: '<path d="M3 14c3-2 5 2 8 0s5-2 10 0v7H3Z"/><rect x="8" y="6" width="8" height="7" rx="1"/><path d="M12 3v3M9 4l3-2 3 2"/>',
  flow: '<path d="M2 8h7l3 3 3-3h7v8h-7l-3-3-3 3H2Z"/><path d="M4 12h16"/>',
  engine: '<circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><path d="m9 9 6 3-6 3Z"/>',

  mechanics: '<circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M7 14 10 7h5l2 7M10 7 8 4M15 7l2-3M4 20h16"/>',
  gravity: '<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="20" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
  projectile: '<path d="M3 19c6-12 12-12 18-3"/><circle cx="5" cy="16" r="2"/><path d="m16 12 5 4-6 1"/>',
  collision: '<rect x="2" y="8" width="8" height="7" rx="2"/><rect x="14" y="8" width="8" height="7" rx="2"/><path d="m11 9 2 3-2 3M13 9l-2 3 2 3"/>',
  pendulum: '<path d="M4 4h16M12 4v3"/><path d="M12 7 7 17"/><circle cx="7" cy="17" r="3"/>',

  house: '<path d="m3 11 9-7 9 7v9H3Z"/><path d="M9 20v-6h6v6"/>',
  solar: '<circle cx="6" cy="6" r="2.5"/><path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.5 2.5l.7.7M8.8 8.8l.7.7M9.5 2.5l-.7.7M3.2 8.8l-.7.7"/><path d="m5 14 15-3-2 10H7Z"/><path d="m12 13-1 7M16 12l-1 7"/>',
  grid: '<path d="M5 21 9 3h6l4 18M7 13h10M6 17h12M8 8h8"/>',
  battery: '<rect x="4" y="6" width="16" height="13" rx="2"/><path d="M9 3h6v3M8 12h8M12 9v6"/>',
  advanced: '<path d="M6 8c0-3 4-4 6 0s6 3 6 0"/><path d="M6 16c0 3 4 4 6 0s6-3 6 0"/><path d="M4 12h16"/>',
  roadmap: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 0 1 4.7.7c0 1.8-2.5 2.1-2.5 3.8"/><path d="M12 17h.01"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  reset: '<path d="M4 10a8 8 0 1 1 2 7"/><path d="M4 4v6h6"/>',
  camera: '<path d="M4 7h4l2-2h4l2 2h4v12H4Z"/><circle cx="12" cy="13" r="4"/>',
  field: '<path d="M4 12h16M12 4v16"/><path d="m16 8 4 4-4 4M8 8l-4 4 4 4M8 8l4-4 4 4M8 16l4 4 4-4"/>',
  potential: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 4v16M4 12h16"/>',
  save: '<path d="M5 4h12l2 2v14H5Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  select: '<path d="M5 3v14l4-4 3 7 3-1-3-7h6Z"/>',
  move: '<path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/>',
  rotate: '<path d="M4 8a9 9 0 1 1-1 6"/><path d="M4 3v5h5"/>',
  connect: '<path d="M8 12h8"/><path d="M6 8H4v8h2M18 8h2v8h-2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>',
  undo: '<path d="m9 7-5 5 5 5"/><path d="M4 12h9a6 6 0 0 1 6 6"/>',
  redo: '<path d="m15 7 5 5-5 5"/><path d="M20 12h-9a6 6 0 0 0-6 6"/>',
  load: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/><path d="M5 4h14"/>',

  export: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  quality: '<path d="M4 18h3V9H4ZM10.5 18h3V5h-3ZM17 18h3V2h-3Z"/>',
  probe: '<circle cx="12" cy="8" r="4"/><path d="M12 12v8M8 20h8"/>',
  instrument: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 15a4 4 0 0 1 8 0M12 11v4M7 8h.01M17 8h.01"/>',
  warning: '<path d="M12 3 2.8 20h18.4Z"/><path d="M12 9v5M12 17h.01"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 2.8 7.7 7 10 4.2-2.3 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/>',
  fullscreen: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
  map: '<path d="m3 6 5-2 8 2 5-2v14l-5 2-8-2-5 2Z"/><path d="M8 4v14M16 6v14"/>',
  audio: '<path d="M5 10v4h3l4 4V6L8 10Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  walk: '<circle cx="12" cy="4.5" r="2"/><path d="m10 8 4 2 2 4M10 8 8 13l3 2-2 6M14 10l-1 5 4 5"/>',
  teleport: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  previous: '<path d="m15 18-6-6 6-6"/>',
  next: '<path d="m9 18 6-6-6-6"/>',
};

export function icon(name, className = 'ui-icon', title = '') {
  const body = ICONS[name] || ICONS.roadmap;
  const titleNode = title ? `<title>${title}</title>` : '';
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${titleNode}${body}</svg>`;
}

export function hydrateIconElements(root = document) {
  root.querySelectorAll('[data-icon]').forEach((element) => {
    const name = element.dataset.icon;
    if (element.dataset.iconHydrated === name) return;
    const target = element.matches('.dock__item') ? element.querySelector('.dock__glyph') : element.querySelector('.icon-slot') || element;
    if (!target) return;
    if (target === element) {
      const label = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim();
      element.innerHTML = `${icon(name)}${label ? `<span>${label}</span>` : ''}`;
    } else {
      target.innerHTML = icon(name);
    }
    element.dataset.iconHydrated = name;
  });
}
