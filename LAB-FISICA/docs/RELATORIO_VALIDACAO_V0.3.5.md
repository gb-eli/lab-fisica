# Relatório de Validação — Física Imersiva 360 v0.3.5

## Escopo

Validação da **Fase Visual 12 — Física Avançada Premium 360** e regressão completa dos laboratórios anteriores.

## Implementação validada

- novo motor `js/science/advanced-physics.js`;
- observatório quântico;
- observatório de relatividade;
- observatório de matéria escura;
- observatório de buracos negros e lente gravitacional;
- observatório de causalidade;
- gráficos científicos;
- parâmetros independentes por experiência;
- câmera 360°, zoom, tela cheia e câmera automática;
- persistência local e exportação de evidência JSON;
- interface mobile e fallback 2D;
- integração com Hall, dock, manifesto e PWA.

## Testes científicos

Foram validados:

- fator de Lorentz;
- dilatação temporal;
- contração do comprimento;
- comparação de viagem interestelar;
- comprimento de onda de de Broglie;
- pacote de onda gaussiano;
- redução da transmissão com aumento da barreira;
- intensidade central da dupla fenda;
- raio de Schwarzschild solar;
- dilatação gravitacional;
- deflexão solar próxima de 1,75 segundos de arco;
- esfera de fótons e ISCO;
- curva galáctica com contribuição do halo;
- intervalos temporais, luminosos e espaciais.

## Regressão

A suíte `npm test` foi aprovada integralmente, preservando:

- Eletrostática;
- instrumentação e redes elétricas;
- Hall Premium;
- pipeline de assets;
- sistema universal de interação;
- Eletromagnetismo;
- Energia;
- Mecânica;
- Ondas, Som e Óptica;
- Termologia, Gases e Fluidos;
- Design System e núcleo de renderização.

## Validação estática

- todos os arquivos JavaScript e MJS passaram em `node --check`;
- todos os JSONs e o webmanifest foram analisados com sucesso;
- 94 referências do cache offline foram verificadas;
- nenhum arquivo do cache estava ausente;
- todas as referências locais do `index.html` foram encontradas;
- 193 arquivos de projeto foram conferidos;
- arquivos essenciais responderam HTTP 200 no servidor local.

## Validação visual automatizada

Foi tentada a abertura da rota `#advanced` com Chromium headless. O processo não concluiu dentro do limite porque o ambiente não possui DBus e apresenta restrições no subsistema gráfico. Nenhuma captura foi considerada válida.

A inspeção final de toque, sombras, partículas, legibilidade e desempenho deve ser realizada em celular e computador reais.

## Limitações confirmadas

- Three.js pode recorrer à CDN fixa;
- os cenários avançados são procedurais, não modelos Blender finais;
- tunelamento usa aproximação WKB;
- a viagem relativística não inclui aceleração;
- o halo galáctico usa perfil simplificado;
- o buraco negro de referência é não rotativo;
- a deflexão usa aproximação de campo fraco;
- não existe relatividade numérica ou ray tracing relativístico completo;
- causalidade não oferece método físico de viagem temporal.

## Resultado

**Aprovado estrutural e cientificamente para publicação como v0.3.5, com validação visual final em aparelhos reais registrada como pendência.**
