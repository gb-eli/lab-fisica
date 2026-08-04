# Histórico de Versões

## 0.4.5 — 04/08/2026

- Fase R6 de piloto WebGL;
- pré-teste de contexto, shaders, desenho e leitura de pixel;
- classificação de capacidade e detecção de software renderer;
- teste de perda/restauração;
- watchdog do primeiro frame;
- fallback 2D automático;
- modo 3D seguro;
- painel diagnóstico nas configurações;
- piloto Chromium/Xvfb/SwiftShader em desktop e mobile;
- capturas e relatório JSON reproduzíveis;
- pacote Three.js local completo permanece pendente.

# v0.4.4 — Playtest e fechamento R5

- corrigido `disposed` ausente em Mecânica, Ondas e Termofluidos;
- corrigida área de clique do botão Apoio;
- visualizações movidas para linha própria;
- HUD flutuante removido;
- catálogo responsivo;
- eventos de prontidão adicionados;
- smoke test Chromium desktop/mobile aprovado no modo 2D.

# v0.4.3 — Reconstrução R4

- 13 cenários guiados de Ondas;
- 12 cenários guiados de Termofluidos;
- 10 cenários guiados de Física Avançada;
- validade do modelo visível;
- leituras térmicas contextuais;
- pausa e reinício no observatório avançado;
- reinício em Ondas;
- regressão integral preservada.

# v0.4.2 — Reconstrução R3: Eletromagnetismo, Energia e Mecânica

- 28 cenários guiados de referência;
- rótulos de leitura contextuais;
- pausa e reinício em Eletromagnetismo e Energia;
- correção das leituras do modo Rede;
- nova orientação responsiva;
- regressão integral preservada.

# v0.4.1 — Reconstrução R2: Hall, Eletrostática e Eletricidade

Hall reorganizado por trilha, Eletrostática 3D manipulável com presets e fallback 2D, bancada elétrica com montagem guiada segura, mobile refinado, cache e testes atualizados.

# v0.4.0 — Reorganização UX/UI, cenários e lógica

Catálogo único, workspace comum, modos de experiência, cenário principal, resultados organizados, mobile cena-primeiro, hub por trilha, auditoria UX e plano de reconstrução dos laboratórios.

## 0.3.8 — 04/08/2026

### Fase Visual 15 — Validação de Uso e Acessibilidade Pedagógica

- criados dez roteiros pedagógicos;
- adicionados quatro checkpoints por rota;
- criado HUD compacto de objetivo e progresso;
- criado tutorial interativo da primeira visita;
- adicionadas detecção de exploração, parâmetros e ações significativas;
- adicionados tempo ativo, conclusão e retomada local;
- criada exportação consolidada de evidência JSON;
- adicionadas instruções simplificadas, alvos ampliados, foco forte e rótulos persistentes;
- adicionada leitura do objetivo sob demanda;
- criada matriz de oito laboratórios por quatro perfis gráficos;
- criados seis critérios de validação de uso;
- adicionadas exportações JSON e CSV;
- preservados os laboratórios e motores científicos anteriores;
- atualizados cache, manifesto, documentação e testes.

# HISTÓRICO DE VERSÕES

## 0.3.7 — 03/08/2026

### Fase Visual 14 — Refinamento Artístico e Kit de Validação em Dispositivos Reais

- criada camada compartilhada de refinamento artístico;
- ampliados materiais físicos e iluminação de inspeção;
- criada barra universal de câmera;
- adicionados inércia, dois dedos, toque duplo e teclado;
- regenerados 12 assets elétricos premium v2;
- preservados 36 GLBs e três LODs;
- adicionados parafusos, molduras, escalas, etiquetas, ventilação e polaridade;
- criada matriz local de validação por aparelho;
- adicionados diagnósticos automáticos e checklist manual;
- adicionadas exportações JSON e CSV;
- atualizados cache, testes, manifestos e documentação;
- mantida como pendência a execução dos testes térmicos, de bateria e percepção visual em hardware real.

## 0.3.6 — 03/08/2026

### Fase Visual 13 — Otimização e Validação Transversal

- ampliado o monitor de desempenho com FPS baixo e p95;
- adicionados orçamentos por perfil gráfico;
- criado otimizador adaptativo em quatro níveis;
- adicionada redução de Points e InstancedMesh;
- adicionada suspensão de cenas ocultas e fora de vista;
- adicionada recuperação WebGL com camada de interface;
- criado registro central de runtimes;
- criado diagnóstico local exportável em JSON;
- ampliado o descarte de recursos e o ciclo de vida dos assets;
- criada auditoria estática e orçamento do pacote;
- mantida a independência científica de todos os laboratórios;
- atualizados PWA, testes, manifestos e documentação.


## 0.3.5 — 03/08/2026

### Fase Visual 12 — Física Avançada Premium 360

- criada engine `js/science/advanced-physics.js`;
- transformada a galeria avançada em laboratório parametrizado;
- implementados pacote gaussiano, de Broglie e tunelamento;
- implementados relógios, contração e viagem relativística;
- implementadas curvas de rotação com disco e halo;
- implementados Schwarzschild, esfera de fótons, ISCO e órbita;
- implementadas dilatação gravitacional e deflexão da luz;
- implementados intervalos e cones de luz;
- adicionados gráficos, parâmetros, salvamento e evidência JSON;
- adicionada interface mobile específica;
- atualizados Hall, PWA, manifesto, testes e documentação.

## 0.3.4 — 03/08/2026

### Fase Visual 11 — Termologia, Gases e Fluidos Premium 360

- criada rota `#thermal`;
- adicionada aba Termofluidos ao dock;
- adicionado oitavo setor ao Hall;
- criada prévia térmica animada no Hall;
- criado motor `js/science/thermodynamics-fluids.js`;
- implementadas calorimetria e conservação de energia;
- implementados calor sensível, latente e dilatação;
- implementadas condução, convecção e radiação;
- implementadas mudanças de estado da água;
- implementados gás ideal e quatro processos gasosos;
- implementadas hidrostática, pressão e empuxo;
- implementados continuidade, Venturi, Bernoulli, Reynolds e Poiseuille;
- implementados motor térmico, refrigeração e limites de Carnot;
- adicionados gráficos, partículas, persistência e exportação;
- atualizados Design System, PWA, manifesto, testes e documentação.

## 0.3.3 — 03/08/2026

### Fase Visual 10 — Ondas, Som e Óptica Premium 360

- criada rota `#waves`;
- adicionada aba Ondas ao dock;
- ativado portal Ondas e Óptica no Hall;
- criado motor científico `js/science/waves-optics.js`;
- implementado tanque de ondas com fonte única, interferência e difração;
- implementadas cordas, tubos, nós, harmônicos e batimentos;
- implementadas acústica, eco, intensidade, nível e reverberação;
- implementado efeito Doppler;
- implementada bancada de lentes, espelhos e refração;
- implementados prisma, espectro, fibra e dupla fenda;
- adicionado áudio seguro opcional;
- adicionados gráficos, câmera lenta, persistência e exportação;
- atualizados Hall, roadmap, Design System, PWA, manifesto, testes e documentação.


## 0.3.2 — 03/08/2026

### Fase Visual 9 — Mecânica, Gravidade e Dinâmica Premium 360

- criada rota `#mechanics`;
- adicionada aba Mecânica ao dock;
- ativado portal Mecânica no Hall;
- criado motor científico `js/science/mechanics.js`;
- implementadas cinemática e queda livre;
- implementada rampa com atrito estático e cinético;
- adicionados vetores tridimensionais de força;
- implementado lançamento ideal e com arrasto linear;
- implementadas colisões 1D com restituição;
- implementados pêndulo e massa-mola amortecidos;
- implementada comparação gravitacional entre Terra, Lua, Marte e Júpiter;
- implementada órbita circular conceitual;
- adicionadas pausa, escala temporal, câmera automática, zoom e tela cheia;
- adicionados gráficos científicos;
- adicionados salvamento e exportação JSON;
- atualizados Hall, roadmap, Design System, PWA, manifesto, testes e documentação.


## 0.3.1 — 03/08/2026

- conclusão da Fase Visual 8B;
- nova rota e aba Energia;
- portal Energia ativado no Hall;
- casa elétrica em corte 3D;
- cargas e circuitos por ambiente;
- quadro com disjuntores, DR e medidor;
- geração solar e eólica;
- bateria, inversor, importação e exportação;
- transformador, postes, rede, queda de tensão e perdas;
- motor `js/science/energy-grid.js`;
- práticas, persistência e exportação JSON;
- testes, cache, manifesto e documentação atualizados.

## 0.3.0 — 03/08/2026

### Fase Visual 8A — Eletromagnetismo e Máquinas Premium 360

- criada rota `#magnetism`;
- adicionada aba Magnetismo ao dock e ao Hall;
- criado motor científico de eletromagnetismo;
- implementados campo de dipolo e superposição;
- implementados solenoide, indutância e energia magnética;
- implementadas Faraday e Lenz;
- implementadas força de Lorentz e força em condutor;
- implementados torque de motor, gerador CA e transformador;
- criado ambiente 3D fechado com materiais PBR;
- criados ímãs, limalha, bússolas e sonda;
- criado eletroímã com núcleo e aquecimento;
- criados motor, gerador e transformador animados;
- adicionadas partículas e formas de onda ligadas ao cálculo;
- adicionadas práticas, salvamento e exportação;
- atualizados PWA, manifesto, contexto, plano e testes.

## 0.2.9 — 03/08/2026

- conclusão da Fase Visual 7 — Laboratório Piloto de Eletricidade Premium;
- criação do solver nodal `js/science/resistive-network.js`;
- topologias série, paralelo e misto;
- três resistores tridimensionais com displays locais;
- cabos 3D reorganizados conforme a topologia;
- cálculo de tensão, corrente e potência por ramo;
- resistência equivalente e potência total;
- modelos ideal, realista e experimental;
- tabela de ramos;
- catálogo para adicionar, duplicar e remover o terceiro ramo;
- práticas guiadas validadas cientificamente;
- exportação de evidência JSON;
- exportação de resultados CSV;
- persistência ampliada;
- testes automatizados do solver e da fase;
- cache, manifesto, documentação e contexto atualizados.

## 0.2.8 — 03/08/2026

- conclusão da Fase Visual 6;
- expansão do pacote elétrico de 6 para 12 assets;
- criação de 36 GLBs com três LODs;
- adição de amperímetro, voltímetro, fusível, reostato, diodo e LED;
- criação do motor `electrical-instruments.js`;
- fonte regulável com modos CV e CC;
- multímetro com tensão, corrente, resistência e continuidade;
- bornes COM, VΩ e A;
- ligação guiada das pontas de prova em 3D;
- terminais com capacidade de derivação;
- fusível do circuito e fusível interno do multímetro;
- erros de ligação, curto controlado e diagnóstico;
- precisão, resolução e incerteza instrumental;
- polaridade de LED e diodo;
- reostato, displays e estados térmicos animados;
- novos testes científicos, assets, cache e documentação.

## 0.2.7 — 03/08/2026

- conclusão da Fase Visual 5;
- criação de `js/interaction/`;
- serviço universal de seleção por raycasting;
- contorno e gizmo com eixos X, Y e Z;
- movimento livre, movimento por eixo e rotação;
- limites por equipamento;
- encaixe magnético e rotação quantizada;
- terminais visuais e modo Conectar;
- cabos dinâmicos que acompanham os equipamentos;
- grafo elétrico com validação de caminho;
- bloqueio da câmera durante manipulação;
- toque prolongado e atalhos de teclado;
- histórico de comandos, desfazer e refazer;
- salvamento e recuperação local da montagem;
- documentação e testes da interação universal;
- versão, manifesto e cache PWA atualizados.

## 0.2.6 — 03/08/2026

### Fase Visual 4 — Hall Científico 360 Premium

- reconstruída a arquitetura do Hall;
- adicionados átrio fechado, cúpula, paredes e colunas;
- criados corredores radiais e passarela superior;
- criado núcleo central com elevador animado;
- criadas sete salas físicas;
- integrados portais às salas;
- adicionada iluminação por setor;
- criadas prévias animadas dos sete conteúdos;
- integrado pacote GLB elétrico à prévia de Circuitos;
- criado passeio guiado com transições de câmera;
- adicionados controles anterior, próximo e visão geral;
- criado mapa holográfico 3D;
- criado mapa textual e alternativa 2D;
- criado painel contextual de setor;
- adicionados seleção por raycasting e entrada por portal;
- adicionados áudio ambiente local e posicionamento HRTF;
- adicionados tela cheia, fallback e adaptação mobile;
- criado teste automatizado do Hall Premium;
- atualizados PWA, manifesto, contexto e documentação.

## 0.2.5 — 03/08/2026

### Fase Visual 3 — Pipeline profissional de assets 3D

- criado loader GLB 2.0 local;
- criado gerenciador de assets com cache, LOD e fallback;
- criados 18 GLBs do pacote elétrico inicial;
- adicionadas texturas PBR locais;
- adicionados colisores JSON;
- criado gerador reproduzível em Python;
- criada primeira bancada elétrica 3D;
- adicionados displays sincronizados, seleção, foco e contorno;
- adicionados cabos 3D com fluxo de corrente;
- migrado laboratório de Ohm da maquete DOM para a cena 3D;
- adicionados testes do pipeline e orçamento de tamanho;
- atualizados PWA, contexto e documentação.

## 0.2.4 — 03/08/2026

- conclusão da Fase Visual 2;
- criação do núcleo compartilhado em `js/render/`;
- carregador centralizado com tentativa local e fallback CDN fixo;
- Hall e Física Avançada migrados para o mesmo runtime;
- controle orbital compartilhado para mouse, toque, pinça e zoom;
- environment map procedural processado por PMREM;
- biblioteca PBR para metal, vidro, cerâmica, polímero e emissivos;
- tone mapping e sombras padronizados;
- pós-processamento leve opcional;
- resolução dinâmica por média de FPS;
- diagnóstico de draw calls, triângulos, geometrias e texturas;
- tratamento de perda e restauração do contexto WebGL;
- descarte centralizado de recursos;
- novas configurações de renderização;
- testes do núcleo gráfico;
- documentação, cache, manifesto, status e contexto atualizados.

## 0.2.3 — 03/08/2026

- conclusão da Fase Visual 1;
- criação de `css/design-system.css`;
- criação de temas funcionais por módulo em `js/design-system.js`;
- criação da biblioteca própria de ícones SVG em `js/ui/icons.js`;
- topbar contextual com setor e nome do laboratório;
- dock redesenhado e responsivo;
- paleta funcional de funcionamento, medição, atenção, risco, falha e desativado;
- linguagem de materiais técnicos compartilhada;
- painéis, badges, botões, toolbars e readouts padronizados;
- status científicos adicionados aos laboratórios de Coulomb e Ohm;
- painéis de instrumentação adicionados aos módulos atuais;
- novas preferências de densidade, escala e transparência;
- documentação `DESIGN_SYSTEM_CIENTIFICO.md`;
- testes automatizados do design system;
- cache, manifesto, status e contexto atualizados.

## 0.2.2 — 03/08/2026

- revisão crítica da qualidade gráfica atual;
- Química removida da Física Imersiva 360;
- escopo fixado exclusivamente em Física;
- criação do Plano de Evolução Visual 360;
- criação do Padrão Gráfico Obrigatório;
- criação do manifesto `assets/graphics-standard.json`;
- criação do documento de plataformas futuras separadas;
- perfis gráficos enriquecidos com parâmetros de sombras, detalhe, LOD e pós-processamento;
- Hall procedural ampliado com piso texturizado, plataforma central, colunas, teto e painéis;
- portais atualizados com membranas animadas por shader;
- sombras adaptativas ativadas nos perfis compatíveis;
- roadmap reduzido para treze fases exclusivamente de Física;
- documentação, testes, cache e contexto atualizados.

## 0.2.1 — 03/08/2026

- nova aba e portal **Física Avançada**;
- rota `#advanced` integrada ao dock e ao Hall 3D;
- observatório procedural Three.js com órbita, zoom, pinça e modo imersivo;
- seis prévias selecionáveis: Física Quântica, Matéria Escura, Relatividade, Buracos Negros, Tempo/Causalidade e Química Avançada;
- controle de intensidade visual, velocidade e partículas;
- avisos explícitos sobre teoria consolidada, evidência indireta, aproximações e especulação;
- matéria escura apresentada como evidência gravitacional, sem alegar visualização direta;
- viagem no tempo identificada como discussão teórica e não tecnologia existente;
- roadmap ampliado para 14 fases;
- manifesto, cache PWA, documentação, status e contexto atualizados.

## 0.2.0 — 03/08/2026

- Hall procedural real em Three.js/WebGL 2;
- fallback 2D preservado;
- câmera orbital, câmera automática e restauração;
- portais tridimensionais com rótulos acessíveis;
- diagnóstico do dispositivo;
- adaptação básica de resolução por FPS;
- motor eletrostático separado do canvas;
- sonda de campo e potencial;
- mapa de potencial;
- salvamento local e exportação JSON;
- testes automatizados da Lei de Coulomb, campo, potencial e superposição;
- documentação e prompt de contexto atualizados;
- manifesto inicial de assets;
- documentação de dependências;
- cache PWA atualizado.

## 0.1.0 — 03/08/2026

- primeira versão executável;
- Hall responsivo 2.5D;
- navegação modular;
- configurações gráficas;
- protótipo funcional de Coulomb;
- protótipo funcional de Lei de Ohm;
- PWA básico;
- plano mestre e contexto consolidado.

## v0.3.9 — Recuperação estrutural e estabilidade

- expansão de fases interrompida para corrigir a base;
- dock principal reduzido;
- hub simplificado de laboratórios;
- Hall reorganizado;
- objetivo e três etapas em cada rota;
- modo 2D seguro;
- WebGL 1/2 e carregador Three.js com alternativas;
- tratamento de erros em todas as montagens 3D assíncronas;
- roteador com histórico e descarte de navegações obsoletas;
- service worker corrigido;
- central de diagnóstico local;
- novos testes de recuperação.
