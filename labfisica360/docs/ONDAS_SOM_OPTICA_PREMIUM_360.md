# Ondas, Som e Óptica Premium 360

## Versão

Física Imersiva 360 — v0.3.3 — Fase Visual 10.

## Objetivo

Criar um laboratório único para fenômenos ondulatórios, acústica e óptica, com seis experiências 3D/360°, parâmetros manipuláveis, gráficos, áudio seguro, câmera lenta e um motor científico separado do Three.js.

## Arquitetura

- interface: `js/modules/waves.js`;
- cena: `js/modules/waves3d.js`;
- ciência: `js/science/waves-optics.js`;
- estilo: `css/waves-lab.css`;
- testes: `tests/waves-optics.test.mjs` e `tests/waves-premium.test.mjs`.

## Experiência 1 — Tanque de ondas

- superfície líquida adaptativa;
- fonte única, duas fontes e difração;
- amplitude, frequência, velocidade, fase, separação e fenda;
- comprimento de onda e período;
- superposição calculada em cada ponto;
- sonda tridimensional;
- frentes de onda e partículas vinculadas ao estado físico.

## Experiência 2 — Ressonância e instrumentos

- corda com extremidades fixas;
- nós e ventres;
- tensão, densidade linear, comprimento e harmônico;
- tubo aberto e tubo fechado;
- frequência fundamental e harmônicos;
- batimentos;
- visualização de partículas em colunas de ar.

## Experiência 3 — Som e acústica

- alto-falante e microfone 3D;
- compressões e rarefações;
- velocidade do som em função da temperatura;
- intensidade e nível sonoro físico calculado;
- eco;
- distância pelo tempo de ida e volta;
- reverberação por aproximação de Sabine;
- painéis absorventes;
- sinal sonoro opcional com ganho limitado.

## Experiência 4 — Efeito Doppler

- fonte móvel;
- observador móvel;
- frentes de onda emitidas ao longo do trajeto;
- frequência emitida e percebida;
- comprimento de onda à frente e atrás;
- movimento em sentidos positivos e negativos;
- áudio seguro usando a frequência calculada.

## Experiência 5 — Bancada óptica

- lente convergente ou divergente;
- espelho esférico;
- interface entre meios;
- objeto e imagem;
- tela;
- raios principais;
- distância focal, objeto e imagem;
- aumento e orientação;
- Lei de Snell;
- reflexão interna total;
- ângulo crítico.

## Experiência 6 — Fotônica

- prisma transparente;
- dispersão por comprimento de onda;
- espectro visível;
- fibra óptica curva;
- núcleo e revestimento;
- abertura numérica e ângulo de aceitação;
- partículas de luz guiada;
- dupla fenda;
- franjas e envelope de difração;
- cor calculada a partir do comprimento de onda.

## Fórmulas centrais

- `v = λf`;
- `T = 1/f`;
- onda harmônica e superposição;
- `v_corda = √(F/μ)`;
- `f_n = nv/(2L)`;
- intensidade esférica `I = P/(4πr²)`;
- nível `β = 10 log10(I/I₀)`;
- eco `d = vΔt/2`;
- Doppler `f' = f(v+v_o)/(v-v_s)` na convenção documentada;
- Lei de Snell;
- equação de lentes e espelhos;
- ângulo crítico;
- abertura numérica;
- espaçamento de franjas da dupla fenda.

## Realismo e segurança

- o áudio inicia desligado e depende de ação explícita;
- o ganho do sinal é limitado;
- valores de dB são cálculos físicos e não definem diretamente o volume do dispositivo;
- efeitos visuais não substituem o cálculo;
- o FPS não altera frequências, ângulos ou resultados;
- fenômenos 3D possuem alternativa gráfica e textual.

## Mobile e acessibilidade

- câmera orbital por toque;
- zoom por pinça;
- controles empilhados em telas menores;
- fallback 2D;
- redução de movimento;
- alto contraste;
- experiência completa sem áudio;
- gráficos e leituras textuais.

## Limitações

- a superfície do tanque é um modelo linear educacional;
- a acústica não executa simulação completa de fluidos;
- Sabine é uma aproximação para salas difusas;
- a óptica geométrica utiliza lentes e espelhos ideais;
- não há ray tracing óptico espectral completo;
- a fibra utiliza guia geométrico e não resolve modos eletromagnéticos;
- modelos são procedurais detalhados, ainda não assets Blender finais;
- validação visual final em aparelhos reais permanece necessária.
