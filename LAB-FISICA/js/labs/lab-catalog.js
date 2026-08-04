export const LAB_CATALOG = Object.freeze([
  {
    route: 'coulomb', order: 1, icon: 'coulomb', color: 0x42d7ff, category: 'fundamentos',
    group: 'Eletrostática', title: 'Coulomb, campo e potencial', shortTitle: 'Eletrostática', subtitle: 'Forças, campo e potencial',
    level: 'Ensino Médio', status: 'Laboratório 2D interativo', estimatedMinutes: 25,
    objective: 'Mova as cargas e a sonda para relacionar sinal, distância, força, campo e potencial elétrico.',
    steps: ['Posicione as cargas', 'Altere os valores e a distância', 'Compare força, campo e potencial'],
    controls: 'Arraste as cargas ou a sonda no canvas. Ative campo e potencial separadamente e altere somente um parâmetro por vez.',
    learningQuestion: 'Como sinal e distância alteram a interação elétrica?',
    scenarios: ['Força entre cargas', 'Campo elétrico', 'Potencial elétrico'],
  },
  {
    route: 'ohm', order: 2, icon: 'ohm', color: 0xffc66d, category: 'eletricidade',
    group: 'Eletricidade', title: 'Circuitos e instrumentos', shortTitle: 'Circuitos', subtitle: 'Corrente, potência e energia',
    level: 'Ensino Médio e técnico', status: 'Bancada 3D + modo 2D', estimatedMinutes: 35,
    objective: 'Monte uma topologia, conecte os instrumentos corretamente e diagnostique falhas elétricas sem risco real.',
    steps: ['Escolha série, paralelo ou misto', 'Ajuste fonte e resistores', 'Meça, compare e diagnostique'],
    controls: 'Comece pelos controles básicos. Abra manipulação 3D, histórico e exportação somente quando precisar.',
    learningQuestion: 'Como a topologia modifica corrente, tensão e potência em cada componente?',
    scenarios: ['Circuito em série', 'Circuito em paralelo', 'Circuito misto'],
  },
  {
    route: 'magnetism', order: 3, icon: 'field', color: 0x9f82ff, category: 'eletricidade',
    group: 'Eletromagnetismo', title: 'Campos e máquinas', shortTitle: 'Eletromagnetismo', subtitle: 'Campos, bobinas e máquinas',
    level: 'Ensino Médio e técnico', status: 'Reconstruído R3 · 3D + modo 2D', estimatedMinutes: 30,
    objective: 'Aplique um cenário de referência e relacione corrente, espiras, movimento e campo com força, indução e conversão de energia.',
    steps: ['Escolha uma experiência', 'Altere um parâmetro', 'Compare campo, força ou energia'],
    controls: 'Use uma experiência por vez: ímãs, solenoide, indução, motor, gerador ou transformador.',
    learningQuestion: 'Como corrente e movimento produzem campos, forças e tensão induzida?',
    scenarios: ['Ímãs', 'Solenoide', 'Indução', 'Motor', 'Gerador', 'Transformador'],
  },
  {
    route: 'energy', order: 4, icon: 'energy', color: 0x59e89f, category: 'aplicada',
    group: 'Energia', title: 'Casa elétrica e rede', shortTitle: 'Energia', subtitle: 'Consumo, proteção e distribuição',
    level: 'Ensino Médio e técnico', status: 'Reconstruído R3 · 3D + modo 2D', estimatedMinutes: 30,
    objective: 'Compare cenários de consumo, proteção, geração local e rede observando uma grandeza prioritária por vez.',
    steps: ['Escolha o cenário', 'Ligue ou ajuste cargas', 'Analise proteção, custo e perdas'],
    controls: 'Casa, quadro, microgeração e rede são experiências independentes. Não configure todos ao mesmo tempo.',
    learningQuestion: 'Onde a energia é consumida, transformada, armazenada e perdida?',
    scenarios: ['Casa elétrica', 'Proteções', 'Microgeração', 'Rede de distribuição'],
  },
  {
    route: 'mechanics', order: 5, icon: 'mechanics', color: 0xff728a, category: 'fundamentos',
    group: 'Mecânica', title: 'Movimento e dinâmica', shortTitle: 'Mecânica', subtitle: 'Forças, gravidade e movimento',
    level: 'Ensino Médio e técnico', status: 'Reconstruído R3 · 3D + modo 2D', estimatedMinutes: 30,
    objective: 'Use cenários de referência para observar como uma condição inicial altera movimento, energia, colisões ou órbitas.',
    steps: ['Escolha a experiência', 'Ajuste as condições iniciais', 'Leia vetores, medidas e gráfico'],
    controls: 'Pause, reinicie e use câmera lenta. Cada experiência possui parâmetros próprios.',
    learningQuestion: 'Como forças e condições iniciais determinam o movimento?',
    scenarios: ['Dinâmica e atrito', 'Projéteis', 'Colisões', 'Oscilações', 'Gravidade e órbita'],
  },
  {
    route: 'waves', order: 6, icon: 'wave', color: 0x72a7ff, category: 'fundamentos',
    group: 'Ondas e óptica', title: 'Ondas, som e luz', shortTitle: 'Ondas e Óptica', subtitle: 'Som, luz e fenômenos ondulatórios',
    level: 'Ensino Médio', status: 'Laboratório 3D + modo 2D', estimatedMinutes: 30,
    objective: 'Compare propagação, interferência, ressonância, acústica e formação de imagens.',
    steps: ['Escolha o fenômeno', 'Altere frequência, geometria ou meio', 'Compare padrão e gráfico'],
    controls: 'O áudio é opcional. Todas as leituras funcionam sem som e sem cena 3D.',
    learningQuestion: 'Como fonte, meio e geometria modificam ondas e imagens?',
    scenarios: ['Tanque de ondas', 'Ressonância', 'Acústica', 'Doppler', 'Óptica', 'Fotônica'],
  },
  {
    route: 'thermal', order: 7, icon: 'thermal', color: 0xff9563, category: 'aplicada',
    group: 'Termofluidos', title: 'Calor, gases e fluidos', shortTitle: 'Termofluidos', subtitle: 'Calor, pressão e escoamento',
    level: 'Ensino Médio e técnico', status: 'Laboratório 3D + modo 2D', estimatedMinutes: 30,
    objective: 'Relacione energia térmica, pressão, vazão, empuxo e eficiência com parâmetros mensuráveis.',
    steps: ['Escolha o fenômeno', 'Altere as propriedades', 'Compare energia, pressão ou estado'],
    controls: 'Abra somente o conjunto de parâmetros da experiência atual. Os demais ficam recolhidos.',
    learningQuestion: 'Como energia e propriedades dos materiais alteram temperatura, pressão e fluxo?',
    scenarios: ['Calorimetria', 'Transferência de calor', 'Fases e gases', 'Hidrostática', 'Bernoulli', 'Máquinas térmicas'],
  },
  {
    route: 'advanced', order: 8, icon: 'advanced', color: 0xff68d4, category: 'avancada',
    group: 'Física avançada', title: 'Quântica e relatividade', shortTitle: 'Física Avançada', subtitle: 'Quântica, cosmos e causalidade',
    level: 'Aprofundamento', status: 'Modelos didáticos 3D + 2D', estimatedMinutes: 30,
    objective: 'Explore modelos declarados, distinguindo cálculo, representação didática e limites científicos.',
    steps: ['Escolha o observatório', 'Ajuste os parâmetros', 'Leia resultados e limitações'],
    controls: 'As cenas são representações didáticas; os valores são calculados pelo motor científico.',
    learningQuestion: 'O que o modelo calcula e o que a cena apenas representa?',
    scenarios: ['Quântica', 'Relatividade', 'Matéria escura', 'Buracos negros', 'Causalidade'],
  },
]);

export const LAB_BY_ROUTE = Object.freeze(Object.fromEntries(LAB_CATALOG.map((lab) => [lab.route, lab])));

export const SYSTEM_ROUTES = Object.freeze({
  hall: {
    route: 'hall', group: 'Orientação', title: 'Hall Científico 360', shortTitle: 'Hall',
    objective: 'Escolha um laboratório e entenda, antes de entrar, o que será observado e controlado.',
    steps: ['Escolha um setor', 'Leia o objetivo', 'Abra o laboratório'],
    controls: 'Arraste para girar, use pinça ou roda para zoom. A lista textual funciona mesmo sem 3D.',
  },
  roadmap: {
    route: 'roadmap', group: 'Navegação', title: 'Laboratórios', shortTitle: 'Laboratórios',
    objective: 'Encontre rapidamente o laboratório adequado pelo conteúdo e pelo objetivo de aprendizagem.',
    steps: ['Escolha uma área', 'Leia a pergunta central', 'Abra a experiência'],
    controls: 'Use os filtros por área ou siga a ordem recomendada de aprendizagem.',
  },
});

export const ROUTE_META = Object.freeze({ ...SYSTEM_ROUTES, ...LAB_BY_ROUTE });

export function getLab(route) {
  return ROUTE_META[route] || SYSTEM_ROUTES.hall;
}

export function getLearningPath() {
  return [...LAB_CATALOG].sort((a, b) => a.order - b.order);
}
