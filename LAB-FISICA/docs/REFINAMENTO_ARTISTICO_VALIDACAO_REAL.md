# Refinamento Artístico e Validação em Dispositivos Reais

Implementação funcional: **v0.3.7 — Fase Visual 14**.

## Objetivo

Elevar a leitura visual e a inspeção dos laboratórios sem alterar os motores científicos, além de fornecer uma forma reproduzível de registrar resultados em celulares, tablets, Chromebooks e computadores reais.

## Refinamento do núcleo compartilhado

Foi criado `js/render/artistic-refinement.js`, integrado automaticamente por `js/render/runtime.js`.

Recursos:

- luz de inspeção presa à câmera;
- preenchimento quente discreto;
- ajuste de acabamento físico dos materiais;
- dithering;
- intensificação controlada do environment map;
- clearcoat em superfícies compatíveis;
- sombras de objetos opacos dentro de um limite seguro de geometria;
- opção para desligar detalhes de superfície;
- opção para desligar a iluminação de inspeção.

## Materiais

`js/render/materials.js` passou a oferecer acabamentos específicos para:

- metal;
- metal pintado;
- vidro;
- cerâmica;
- polímero;
- borracha;
- visor;
- etiqueta;
- sinalização de advertência;
- materiais emissivos.

Os ajustes visuais não modificam grandezas físicas, medições ou gráficos.

## Câmera 3D

O controlador orbital compartilhado recebeu:

- inércia após o arraste;
- zoom suave por roda;
- pinça para zoom;
- movimento do alvo com dois dedos;
- toque duplo para restaurar;
- setas do teclado;
- teclas `+`, `-` e `0`;
- barra visual com girar, aproximar, afastar e restaurar;
- controles adaptados às áreas seguras do celular.

Todos os laboratórios WebGL existentes foram ligados à mesma barra de câmera.

## Assets elétricos premium v2

O gerador `tools/generate_asset_pack.py` foi atualizado e reproduz o pacote `premium-procedural-v2`.

Foram preservados:

- 12 assets;
- 36 GLBs;
- três LODs;
- escala em metros;
- eixo Y;
- frente -Z;
- colisores;
- nomes interativos;
- materiais PBR;
- fallback procedural.

Foram acrescentados, conforme o equipamento e o nível de detalhe:

- parafusos;
- molduras;
- etiquetas;
- marcações de escala;
- marcações de polaridade;
- ventilação;
- acabamento de borda;
- tapete antiestático;
- régua da bancada;
- peças internas do LED;
- clipes do fusível;
- proteção de visor;
- sinalização de superfície quente.

## Escopo honesto

Esses modelos são assets procedurais de maior detalhe, gerados localmente e validados como GLB 2.0. Eles não devem ser descritos como modelos Blender finais feitos manualmente.

A arquitetura permite substituí-los por modelos DCC futuros sem alterar IDs, pivôs, terminais ou contratos da bancada.

## Validação real

A ferramenta de matriz foi implementada, mas temperatura, bateria, sensação tátil, legibilidade e qualidade final das sombras só podem ser confirmadas em hardware real. Esses itens permanecem pendentes até que relatórios exportados sejam coletados.
