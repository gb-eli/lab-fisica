# Atualização v0.4.8 — Orientação visual contextual

O modo guiado usa um HUD DOM compacto e contextual, sem transformar a cena em dashboard. O alvo recebe contorno, seta, texto e foco; no celular o painel se desloca para o lado oposto. Redução de movimento é obrigatória e o centro da cena deve permanecer livre. Recursos visuais do mentor só podem carregar depois da escolha explícita.

---

# Atualização v0.4.7 — Qualidade visual com carregamento por demanda

A qualidade 3D continua obrigatória dentro de cada laboratório, mas não deve ocupar a tela inicial nem consumir GPU antes da escolha do estudante. O portal usa uma composição científica 2D responsiva; Hall, bancadas, materiais PBR, shaders e modelos permanecem nas rotas próprias.

Todo novo refinamento visual deverá declarar: módulo proprietário, assets utilizados, orçamento, ponto de carregamento e rotina de descarte. Nenhum efeito pesado poderá voltar ao shell inicial.

---

# Atualização v0.4.0 — Revisão visual orientada à aprendizagem

Priorizar legibilidade, escala, foco e resposta funcional antes de aumentar partículas ou decoração. A reconstrução será executada laboratório por laboratório conforme `MAPA_BANCADAS_CENARIOS_V0.4.0.md`.

# PLANO DE EVOLUÇÃO VISUAL 360

## Física Imersiva 360 — reconstrução de qualidade gráfica

## 1. Motivo da revisão

A versão atual comprova navegação, modularização e alguns cálculos científicos, mas ainda possui aparência de protótipo. O Hall usa principalmente geometrias procedurais simples, os laboratórios não possuem equipamentos de alta fidelidade, e ainda faltam materiais PBR, ambientes detalhados, pós-processamento controlado, animações mecânicas, física de cabos, áudio espacial e instrumentos próximos dos reais.

A partir desta revisão, **não será criado um novo laboratório completo antes de existir um padrão gráfico, interativo e científico reutilizável**.

## 2. Escopo exclusivo

Este repositório passa a ser exclusivamente de **Física**.

Química, História, Matemática Financeira, Enfermagem e Segurança do Trabalho são possibilidades para plataformas independentes, com identidade, requisitos, riscos e motores próprios. Elas não devem aparecer como salas ou módulos internos da Física Imersiva 360.

## 3. Meta de qualidade

Cada laboratório deverá parecer uma instalação científica utilizável e não um painel ilustrativo. O padrão mínimo inclui:

- ambiente 3D navegável em 360°;
- equipamentos com proporções, peças e materiais coerentes;
- objetos manipuláveis com zoom, rotação e encaixe;
- controles que alteram o modelo científico real;
- instrumentos com visores, escalas, terminais e estados;
- animações mecânicas sincronizadas com o cálculo;
- partículas funcionais, e não apenas decorativas;
- câmeras livre, orbital, bancada, microscópica e análise;
- modos Ideal, Didático Realista e Experimental;
- funcionamento em celular, tablet, Chromebook e notebook;
- perfis Econômico, Médio, Alto, Ultra e Científico;
- fallback acessível sem destruir a atividade.

---

# 4. Fases de reconstrução visual

## Fase Visual 0 — Separação, auditoria e congelamento de escopo

### Objetivos

- remover Química da Física Imersiva 360;
- identificar tudo que é protótipo ou placeholder;
- impedir expansão de conteúdo sem padrão visual;
- documentar o nível real de cada módulo;
- criar um inventário de assets ausentes.

### Entregas

- plano visual;
- padrão gráfico obrigatório;
- manifesto de qualidade;
- lista de assets por laboratório;
- roadmap reorganizado;
- prompt de contexto atualizado.

### Critério de conclusão

Nenhuma parte da plataforma pode afirmar que é realista ou definitiva quando ainda utiliza formas genéricas.

---

## Fase Visual 1 — Direção artística e design system científico — CONCLUÍDA NA v0.2.3

### Objetivos

Definir uma identidade única para toda a plataforma.

### Padrões

- arquitetura de centro de pesquisa contemporâneo;
- superfícies em metal, vidro técnico, cerâmica, polímeros e borracha;
- cores de função, não cores aleatórias;
- tipografia técnica legível;
- sinalização de segurança;
- etiquetas e unidades consistentes;
- HUD discreto, recolhível e contextual;
- painéis que não pareçam dashboard administrativo;
- transições lentas e precisas, sem excesso de brilho.

### Entregas implementadas

- `css/design-system.css`;
- `js/design-system.js`;
- `js/ui/icons.js`;
- `docs/DESIGN_SYSTEM_CIENTIFICO.md`;
- temas por módulo;
- preferências de densidade, escala e transparência;
- tokens de materiais;
- paleta funcional;
- padrão de iluminação;
- padrão de painéis;
- biblioteca de ícones científicos;
- estados visuais de seleção, erro, risco, medição e funcionamento.

---

## Fase Visual 2 — Núcleo de renderização premium — CONCLUÍDA NA v0.2.4

### Objetivos

Substituir a renderização básica por um núcleo reutilizável.

### Recursos

- Three.js local ou empacotado;
- gerenciamento de cena, câmera e resize;
- iluminação física híbrida;
- sombras adaptativas;
- tone mapping consistente;
- environment maps;
- materiais PBR;
- reflexão e transparência controladas;
- pós-processamento opcional;
- bloom apenas em emissores;
- oclusão ambiente ou alternativa compatível;
- resolução dinâmica;
- recuperação de contexto WebGL;
- monitor de draw calls, triângulos, memória e FPS;
- descarte correto de recursos.

### Entregas implementadas

- `js/render/runtime.js`;
- `js/render/three-loader.js`;
- `js/render/orbit-controller.js`;
- `js/render/environment.js`;
- `js/render/materials.js`;
- `js/render/postfx.js`;
- `js/render/performance-monitor.js`;
- `js/render/dispose.js`;
- Hall e Física Avançada migrados;
- resolução dinâmica, métricas e recuperação WebGL;
- configurações de pós-processamento e diagnóstico;
- documentação `docs/NUCLEO_RENDERIZACAO_PREMIUM.md`.

### Pendência mantida

A tentativa de vendor local foi preparada, mas a distribuição completa do Three.js não foi incorporada nesta execução. O fallback CDN fixo permanece ativo.

### Critério de conclusão

Hall e laboratórios usam o mesmo núcleo de renderização, sem duplicar configuração ou criar efeitos incompatíveis. O empacotamento local integral permanece como melhoria técnica da fase de assets.

---

## Fase Visual 3 — Pipeline profissional de assets 3D — CONCLUÍDA NA v0.2.5

### Objetivos

Criar um processo previsível para equipamentos e ambientes.

### Pipeline

1. modelagem e limpeza no Blender ou ferramenta equivalente;
2. escala métrica e orientação padronizadas;
3. pivôs posicionados para interação;
4. UVs e materiais organizados;
5. exportação GLB/glTF 2.0;
6. compressão Meshopt ou Draco conforme teste;
7. texturas KTX2/Basis quando possível;
8. LOD 0, 1 e 2;
9. colisores simplificados;
10. validação automática de nomes, tamanho e materiais.

### Assets prioritários

- fonte regulável;
- resistor e componentes;
- multímetro;
- amperímetro;
- voltímetro;
- cabos e conectores;
- interruptor;
- lâmpada;
- LED;
- bobinas;
- ímãs;
- motores;
- geradores;
- bancadas;
- quadros elétricos;
- equipamentos de segurança.

### Entregas implementadas

- contrato GLB 2.0 em metros, eixo Y e frente -Z;
- loader local `js/assets/glb-loader-lite.js`;
- gerenciador `js/assets/asset-manager.js`;
- biblioteca de texturas PBR;
- fallback procedural;
- três LODs para seis assets elétricos;
- colisores JSON;
- manifesto por equipamento;
- gerador reproduzível em `tools/generate_asset_pack.py`;
- fonte, multímetro, resistor, interruptor, lâmpada e bancada;
- cabos tridimensionais com partículas;
- migração visual do laboratório de Ohm;
- documentação e testes de orçamento.

### Limitações mantidas

Os assets desta versão são modelos procedurais detalhados. Eles estabelecem o contrato técnico e a primeira referência visual, mas poderão ser substituídos por modelos Blender de maior fidelidade sem alterar IDs, pivôs, materiais e integrações.

---

## Fase Visual 4 — Hall Científico 360 Premium — CONCLUÍDA NA v0.2.6

### Objetivos

Transformar o Hall em uma experiência de entrada memorável e funcional.

### Entregas implementadas

- arquitetura fechada com cúpula, paredes, piso e colunas;
- átrio central e núcleo-elevador;
- passarela superior e guarda-corpos;
- corredores radiais;
- sete salas setoriais;
- portais integrados às salas;
- iluminação por setor;
- prévias científicas animadas;
- assets GLB elétricos visíveis na sala de Circuitos;
- câmera orbital, zoom e transições;
- passeio guiado;
- mapa holográfico tridimensional;
- mapa acessível em DOM;
- painel contextual;
- áudio ambiente gerado localmente com HRTF;
- partículas ambientais e setoriais;
- tela cheia;
- fallback 2D;
- adaptação de detalhes, luzes e partículas por perfil;
- documentação `docs/HALL_CIENTIFICO_360_PREMIUM.md`;
- testes `tests/hall-premium.test.mjs`.

### Limitações mantidas

- arquitetura procedural;
- prévias predominantemente procedurais;
- somente Circuitos utiliza o pacote GLB atual;
- passeio por câmera, sem avatar ou colisão;
- validação visual em aparelhos reais pendente.

### Critério de conclusão

O Hall possui escala arquitetônica, salas identificáveis, navegação 360°, prévias científicas, mapa, áudio opcional e alternativa acessível. A evolução para assets Blender finais permanecerá possível sem alterar as rotas.

---

## Fase Visual 5 — Sistema universal de interação — CONCLUÍDA NA v0.2.7

### Objetivos

Garantir que objetos e controles se comportem da mesma forma em todos os laboratórios.

### Entregas implementadas

- raycasting compartilhado;
- seleção e contorno;
- gizmo X, Y, Z e anel de rotação;
- movimento livre e por eixo;
- limites de bancada;
- encaixe magnético;
- terminais e cabos dinâmicos;
- validação do grafo elétrico;
- bloqueio de câmera;
- toque prolongado;
- atalhos;
- desfazer/refazer;
- persistência local;
- implementação de referência na bancada elétrica;
- documentação `docs/SISTEMA_UNIVERSAL_INTERACAO.md`.

### Recursos

- raycasting e seleção;
- contorno de seleção;
- gizmos de posição e rotação;
- arraste por eixos;
- encaixe magnético;
- conectores compatíveis;
- cabos flexíveis;
- pegar, soltar, girar, abrir e desmontar;
- undo/redo;
- histórico de montagem;
- foco automático de câmera;
- toque prolongado e pinça no mobile;
- bloqueio da câmera quando um painel estiver em uso.

### Critério de conclusão

O usuário não deve precisar aprender controles diferentes em cada laboratório.

---

## Fase Visual 6 — Padrão de instrumentos e componentes — CONCLUÍDA NA v0.2.8

### Objetivos

Construir uma biblioteca de equipamentos realistas e reutilizáveis.

### Cada instrumento deverá possuir

- modelo externo;
- vista interna ou explodida quando necessária;
- visor ou escala funcional;
- botões, seletores e terminais;
- limites de medição;
- resolução;
- estado de calibração;
- erro de ligação;
- sobrecarga;
- falha;
- som funcional;
- ficha técnica educacional;
- versão simplificada para dispositivos fracos.

---

## Fase Visual 7 — Laboratório piloto de Eletricidade Premium — CONCLUÍDA NA v0.2.9

### Prioridade

Este será o primeiro laboratório usado para validar o padrão completo.

### Conteúdo

- bancada elétrica realista;
- fonte regulável;
- resistores;
- interruptores;
- fios manipuláveis;
- multímetro completo;
- amperímetro e voltímetro;
- circuito aberto, fechado e curto controlado;
- série e paralelo;
- fluxo convencional e visão microscópica;
- potência e aquecimento;
- câmera térmica;
- falhas e diagnóstico;
- gráficos e fórmulas sincronizados.

### Implementado na v0.2.9

- solver nodal separado do renderizador;
- três topologias resistivas;
- três resistores GLB visíveis;
- displays de ramo nos componentes;
- cabos físicos reorganizados conforme a topologia;
- tensão, corrente e potência por ramo;
- modelos ideal, realista e experimental;
- práticas guiadas validadas por cálculo;
- exportação JSON e CSV;
- persistência da montagem.

### Critério de aprovação

O laboratório é demonstrável como referência funcional. Ainda depende de validação visual em aparelhos reais e continuará recebendo evolução de assets, física de cabos e editor nodal livre.

---

## Fase Visual 8A — Eletromagnetismo e Máquinas — CONCLUÍDA NA v0.3.0

Escopo concluído nesta etapa:

1. Magnetismo e materiais;
2. Bobinas e eletroímãs;
3. Indução, motores e geradores;
4. Transformadores.

Casa Elétrica, usinas e Cidade Energética foram movidas para a Fase Visual 8B, pois exigem ambientes e motores próprios. Todos os módulos reutilizam o núcleo, os materiais e o padrão de interação já aprovados.

---

## Fase Visual 9 — Mecânica, Gravidade e Dinâmica Premium 360 — CONCLUÍDA NA v0.3.2

### Entregas

- motor científico separado;
- rampa com atrito estático e cinético;
- vetores de peso, normal, atrito e resultante;
- lançamento de projéteis ideal e com arrasto linear;
- colisões unidimensionais e coeficiente de restituição;
- pêndulo e massa-mola amortecidos;
- queda livre e comparação de gravidades;
- órbita circular conceitual;
- câmera orbital, zoom, pausa, câmera lenta e gráficos;
- mobile, fallback e exportação de evidência.

### Limites

A fase ainda não usa Rapier, as colisões são 1D e os modelos são procedurais. Esses limites estão documentados e não são ocultados.

---

## Fase Visual 10 — Ondas, Som e Óptica Premium 360

### Metas

- ondas transversais e longitudinais;
- interferência, reflexão, refração e difração;
- ondas estacionárias e ressonância;
- acústica, eco e efeito Doppler;
- espelhos, lentes, prismas, cores e fibra óptica;
- instrumentos, gráficos, câmera lenta e visualização de partículas;
- ambiente 3D/360° com modelos científicos separados do renderizador.

---

## Fase Visual 11 — Termologia, Gases e Fluidos Premium 360

- temperatura e equilíbrio térmico;
- condução, convecção e radiação;
- mudanças de estado;
- gases e transformações;
- pressão, empuxo, vazão e Bernoulli;
- mapas térmicos e partículas.

---

## Fase Visual 12 — Otimização multiplataforma contínua

- resolução dinâmica;
- LOD e carregamento por setor;
- instancing e descarregamento de cenas;
- texturas comprimidas;
- sombras e partículas adaptativas;
- metas específicas para celular, Chromebook e GPU integrada.

---

## Fase Visual 13 — Validação visual e científica final

- desktop e mobile;
- mouse, toque e teclado;
- screenshots por estado;
- comparação entre perfis;
- perda e recuperação de contexto;
- consistência entre cálculo, gráfico e animação;
- contraste, redução de movimento e uso prolongado.

---

# 5. Ordem prática de desenvolvimento

1. concluir Fases Visuais 0 e 1;
2. criar o núcleo de renderização da Fase Visual 2;
3. reconstruir o Hall na Fase Visual 4 usando assets do novo pipeline;
4. desenvolver interação e cabos;
5. bancada elétrica premium concluída na v0.2.9;
6. Eletromagnetismo, Energia e Mecânica Premium concluídos;
7. Ondas, Som e Óptica Premium concluída na v0.3.3;
8. Termologia, Calor, Gases e Fluidos concluída na v0.3.4;
9. validar continuamente em dispositivos;
10. expandir a Física Avançada mantendo o mesmo padrão.

# 6. Regra de qualidade

**Quantidade de laboratórios não terá prioridade sobre a qualidade de um laboratório funcional.**

É preferível entregar uma bancada elétrica completa, realista e cientificamente correta do que dez salas formadas por objetos genéricos e animações decorativas.


## Implementado na v0.3.0

- laboratório de Eletromagnetismo 3D/360°;
- seis experiências;
- campos, limalha, bússolas e sonda;
- bobina e solenoide;
- indução;
- motor, gerador e transformador;
- motor científico independente;
- práticas e evidência;
- mobile e fallback.

## Fase Visual 8B — Energia, Casa Elétrica e Rede Premium 360

- casa inspecionável em 3D;
- quadro de distribuição;
- tomadas, iluminação e aparelhos;
- proteção e falhas;
- consumo, kWh e custos;
- solar, eólica e baterias;
- inversor e medidor bidirecional;
- transformadores e rede;
- cidade energética 360°;
- perdas e fluxo de energia.


## Fase Visual 8B concluída

Implementados casa elétrica 3D, quadro e proteções, consumo em kWh, solar, eólica, bateria, inversor, medidor bidirecional, transformador e rede com perdas. A Mecânica Premium foi concluída na v0.3.2; o próximo eixo é Ondas, Som e Óptica Premium 360.


## Fase Visual 10 concluída — v0.3.3

- tanque de ondas com malha adaptativa;
- interferência, difração e sonda;
- cordas, tubos, nós, harmônicos e batimentos;
- acústica, eco, reverberação e áudio seguro;
- Doppler;
- bancada óptica;
- prisma, espectro, fibra e dupla fenda;
- câmera 360°, zoom, gráficos, mobile e fallback.

A próxima evolução visual será Termologia, Calor, Gases e Fluidos Premium 360.


## Fase Visual 11 concluída — v0.3.4

- calorimetria e equilíbrio térmico;
- condução, convecção e radiação;
- mudanças de estado e gás ideal;
- hidrostática e empuxo;
- continuidade, Venturi, Bernoulli, Reynolds e Poiseuille;
- máquina térmica e refrigeração;
- partículas, instrumentos, câmera 360°, gráficos, mobile e fallback.

A próxima evolução será a Física Avançada Premium 360, acompanhada de refinamento visual transversal dos laboratórios existentes.


## Fase Visual 12 concluída — v0.3.5

- pacote de onda, de Broglie e tunelamento;
- relógios relativísticos e contração;
- curvas de rotação e halo galáctico;
- horizonte, esfera de fótons, ISCO e lente gravitacional;
- cones de luz e causalidade;
- gráficos, parâmetros, câmera 360°, mobile e fallback.

A próxima evolução é a otimização multiplataforma e a validação visual transversal de todos os laboratórios.


## Fase Visual 13 concluída — v0.3.6

- monitor de desempenho ampliado;
- orçamentos por perfil;
- otimização adaptativa em quatro níveis;
- suspensão de cenas não visíveis;
- recuperação WebGL;
- diagnóstico local e exportação;
- ciclo de vida de assets;
- auditoria estática;
- regressão científica completa.

### Pendência da fase

A validação visual, tátil e térmica em dispositivos reais não pode ser substituída pelo ambiente automatizado e permanece obrigatória.

## Fase Visual 14 concluída — v0.3.7

- materiais físicos refinados;
- iluminação de inspeção opcional;
- barra universal de câmera;
- inércia, pinça, dois dedos, toque duplo e teclado;
- pacote elétrico premium-procedural-v2;
- 12 assets e 36 GLBs com detalhes de acabamento;
- matriz local de validação por aparelho;
- exportações JSON e CSV;
- testes e regressão completos.

### Pendência externa

Temperatura, bateria, conforto de toque, legibilidade física e qualidade percebida precisam ser registrados em aparelhos reais.

## Próxima fase — Fase Visual 15

Validação de uso, acessibilidade pedagógica e correções orientadas pelos relatórios coletados em hardware real.


## Fase Visual 15 concluída — v0.3.8

- roteiro pedagógico compartilhado;
- dez objetivos completos e simplificados;
- quatro checkpoints por rota;
- tutorial interativo;
- HUD compacto;
- tempo ativo e retomada;
- conclusão e evidência JSON;
- acessibilidade visual, motora e cognitiva;
- matriz laboratório × perfil gráfico;
- validação de coerência entre cálculo, gráfico e animação.

### Pendência externa

A ferramenta de coleta está pronta, mas correções específicas por modelo de aparelho dependem dos relatórios reais exportados.

## Próxima fase — Fase Visual 16

Publicação piloto, consolidação dos relatórios docentes, backup/restauração e correções orientadas por evidência real.

## Fase de Recuperação Estrutural — v0.3.9

A progressão visual foi temporariamente interrompida. O critério de qualidade deixa de ser quantidade de cenários e passa a ser clareza, estabilidade, funcionamento e validação real. Novos assets e efeitos somente serão aceitos quando não aumentarem a confusão ou o risco de falha.
