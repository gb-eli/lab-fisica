# RELATÓRIO DE VALIDAÇÃO — v0.3.2

## Escopo

Fase Visual 9 — Mecânica, Gravidade e Dinâmica Premium 360.

## Validação científica

Foram testados:

- movimento com aceleração constante;
- queda livre e velocidade de impacto;
- componente gravitacional em plano inclinado;
- atrito estático e cinético;
- alcance e altura máxima de projéteis;
- conservação do momento linear;
- colisão elástica e perfeitamente inelástica;
- período de massa-mola;
- período do pêndulo;
- velocidade e período de órbita circular.

## Validação estrutural

Foram confirmados:

- rota `#mechanics`;
- aba no dock;
- portal ativo no Hall;
- tema visual próprio;
- cinco experiências;
- runtime 3D compartilhado;
- câmera orbital e zoom;
- escala temporal;
- vetores de força;
- gráficos;
- fallback 2D;
- layout móvel;
- salvamento e exportação JSON;
- inclusão no cache offline.

## Regressão

Todos os testes das versões anteriores foram mantidos no comando `npm test`, incluindo Eletrostática, Eletricidade, assets, interação, Hall, Eletromagnetismo e Energia.

## Publicação

A estrutura permanece estática e compatível com servidor HTTP e GitHub Pages. Os módulos científicos não dependem de servidor de aplicação.

## Limitações

- não utiliza Rapier nesta versão;
- colisões são unidimensionais;
- arrasto é linear;
- pêndulo usa aproximação angular;
- órbita visual tem compressão temporal;
- modelos são procedurais detalhados;
- inspeção visual final em aparelhos reais ainda é necessária.

## Resultados finais de publicação

- todos os módulos JavaScript passaram em `node --check`;
- 18 arquivos JSON/webmanifest foram analisados;
- 84 referências do cache offline foram encontradas;
- nenhum arquivo do cache estava ausente;
- `index.html`, módulo da aplicação, motor científico, interface, cena 3D, CSS e manifesto responderam HTTP 200;
- o diretório final contém 171 arquivos antes do empacotamento;
- a suíte completa `npm test` foi aprovada.

## Validação visual automatizada

Foi tentada uma captura da rota `#mechanics` com Chromium headless. O processo não finalizou dentro do limite por falhas de DBus e do subsistema gráfico do ambiente. Nenhuma captura foi considerada válida. Essa limitação não foi mascarada como aprovação visual.
