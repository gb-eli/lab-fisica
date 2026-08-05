export const ROUTE_LABELS = Object.freeze({
  mechanics: 'Mecânica',
  coulomb: 'Eletrostática',
  ohm: 'Eletricidade',
  magnetism: 'Eletromagnetismo',
  energy: 'Energia',
  waves: 'Ondas e Óptica',
  thermal: 'Termofluidos',
  advanced: 'Física Avançada',
});

export const MENTORS = Object.freeze([
  {
    id: 'einstein', name: 'Albert Einstein', initials: 'AE', years: '1879–1955',
    field: 'Luz, movimento, energia e interpretação', accent: '#76d9ff', icon: '✦',
    tagline: 'Questione o referencial e imagine o que mudaria.',
    description: 'Trilha inspirada nos experimentos mentais, na investigação da luz, do movimento e da relação entre modelos e observadores.',
    routeOrder: ['mechanics', 'waves', 'energy', 'advanced', 'coulomb'], estimatedMinutes: 120,
  },
  {
    id: 'newton', name: 'Isaac Newton', initials: 'IN', years: '1643–1727',
    field: 'Forças, energia e relações matemáticas', accent: '#ffb96f', icon: '◎',
    tagline: 'Altere uma variável e procure a relação matemática.',
    description: 'Trilha inspirada na análise de forças, condições iniciais, conservação e regularidades matemáticas observáveis.',
    routeOrder: ['mechanics', 'energy', 'coulomb', 'thermal', 'advanced'], estimatedMinutes: 125,
  },
  {
    id: 'faraday', name: 'Michael Faraday', initials: 'MF', years: '1791–1867',
    field: 'Experimentos, campos, circuitos e ondas', accent: '#72efbc', icon: '⌁',
    tagline: 'Monte, mova, meça e descubra o padrão antes da fórmula.',
    description: 'Trilha inspirada na investigação experimental de eletricidade, indução, campos e transformações de energia.',
    routeOrder: ['ohm', 'magnetism', 'energy', 'waves', 'coulomb'], estimatedMinutes: 130,
  },
  {
    id: 'curie', name: 'Marie Curie', initials: 'MC', years: '1867–1934',
    field: 'Medição, energia e evidências experimentais', accent: '#c99cff', icon: '◆',
    tagline: 'Meça com cuidado, repita e compare evidências.',
    description: 'Trilha inspirada no rigor experimental, no registro de medidas e na análise de transformações energéticas e modelos da matéria.',
    routeOrder: ['thermal', 'energy', 'magnetism', 'advanced', 'waves'], estimatedMinutes: 130,
  },
  {
    id: 'tesla', name: 'Nikola Tesla', initials: 'NT', years: '1856–1943',
    field: 'Sistemas elétricos, ressonância e transmissão', accent: '#79a8ff', icon: 'ϟ',
    tagline: 'Conecte circuitos, campos e sistemas de potência.',
    description: 'Trilha inspirada em sistemas de corrente alternada, transformadores, ressonância, geração e transmissão de energia.',
    routeOrder: ['ohm', 'magnetism', 'energy', 'waves', 'advanced'], estimatedMinutes: 135,
  },
  {
    id: 'galileo', name: 'Galileu Galilei', initials: 'GG', years: '1564–1642',
    field: 'Observação, movimento e experimentação', accent: '#ffd36f', icon: '◌',
    tagline: 'Observe, meça, repita e confronte a intuição.',
    description: 'Trilha inspirada na observação quantitativa, na repetição de experiências e no uso de evidências para interpretar movimento e fenômenos naturais.',
    routeOrder: ['mechanics', 'waves', 'thermal', 'energy', 'advanced'], estimatedMinutes: 125,
  },
]);

export const MENTOR_BY_ID = Object.freeze(Object.fromEntries(MENTORS.map((mentor) => [mentor.id, mentor])));

export function getMentor(id) {
  return MENTOR_BY_ID[id] || MENTORS[0];
}
