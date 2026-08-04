# Física Avançada Premium 360

Implementação funcional: **v0.3.5**.

## Objetivo

Evoluir a antiga galeria conceitual para um laboratório parametrizado de Física Avançada, mantendo separação explícita entre cálculo, representação 3D e limitações do modelo. O módulo é opcional e não altera o foco principal da plataforma no Ensino Médio.

## Arquivos centrais

- `js/science/advanced-physics.js`;
- `js/modules/advanced.js`;
- `js/modules/advanced3d.js`;
- `css/advanced-lab.css`;
- `tests/advanced-physics.test.mjs`;
- `tests/advanced-premium.test.mjs`.

## Observatório quântico

- pacote de onda gaussiano;
- densidade de probabilidade;
- comprimento de onda de de Broglie relativístico;
- barreira tridimensional ajustável;
- energia, massa, altura e largura da barreira;
- transmissão e reflexão;
- detector com incidências visuais proporcionais à transmissão.

O tunelamento utiliza aproximação exponencial/WKB em uma barreira retangular. A cena não representa uma trajetória clássica do elétron.

## Observatório de relatividade

- velocidade como fração de `c`;
- fator de Lorentz;
- relógio terrestre e relógio da nave;
- contração visual e numérica do comprimento;
- tempo de viagem medido na Terra e na nave;
- relógio de luz tridimensional.

A experiência considera trechos inerciais uniformes. Aceleração, retorno e gravidade não são incluídos no cálculo de viagem.

## Observatório de matéria escura

- galáxia espiral procedural;
- disco luminoso;
- halo transparente;
- massa encerrada;
- curva de rotação luminosa;
- curva total com halo;
- fração de massa efetiva atribuída ao halo;
- estrelas-sonda em diferentes raios.

O halo é uma metáfora visual. A composição microscópica da matéria escura permanece desconhecida.

## Observatório de buracos negros e lente gravitacional

- horizonte escalonado pelo raio de Schwarzschild;
- esfera de fótons;
- ISCO para o modelo não rotativo;
- disco de acreção procedural;
- sonda orbital;
- fator de dilatação gravitacional;
- período orbital;
- feixes curvados e anéis de lente;
- deflexão aproximada em campo fraco.

A cena não usa ray tracing relativístico espectral e não deve ser interpretada como fotografia científica de precisão.

## Observatório de causalidade

- cones de luz futuro e passado;
- evento de referência;
- evento móvel em três dimensões espaciais;
- intervalo de espaço-tempo;
- separação temporal, luminosa ou espacial;
- velocidade necessária para conexão causal;
- indicação visual de evento dentro ou fora do cone.

A forma de buraco de minhoca presente na cena é identificada como elemento especulativo e não representa tecnologia realizável.

## Recursos comuns

- câmera orbital 360°;
- zoom por mouse e pinça;
- câmera automática;
- tela cheia;
- partículas e rastros opcionais;
- intensidade visual e escala temporal;
- gráficos científicos;
- parâmetros próprios de cada observatório;
- salvamento local;
- exportação JSON;
- interface responsiva;
- redução de movimento;
- modo econômico;
- fallback 2D.

## Limitações

- modelos procedurais, sem assets Blender finais;
- sem solução geral de Schrödinger;
- sem relatividade numérica;
- halo galáctico simplificado;
- buraco negro não rotativo como referência principal;
- deflexão no limite de campo fraco;
- sem simulação cosmológica N-corpos;
- sem método físico demonstrado de viagem temporal;
- validação visual em aparelhos reais ainda necessária.
