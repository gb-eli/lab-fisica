# PIPELINE PROFISSIONAL DE ASSETS 3D

**Fase Visual 3 — versão 0.2.5**

## Objetivo

Estabelecer um contrato permanente para equipamentos tridimensionais utilizados nos laboratórios de Física, evitando geometrias improvisadas e assets incompatíveis entre módulos.

## Contrato de publicação

- formato de entrega: GLB 2.0;
- unidade: metro;
- eixo vertical: Y;
- frente: -Z;
- transformações aplicadas antes da exportação;
- nomes de nós, materiais e pivôs estáveis;
- três níveis de detalhe: LOD 0, LOD 1 e LOD 2;
- colisor separado em JSON;
- fallback procedural obrigatório;
- materiais PBR nomeados;
- nenhum dado pessoal, escolar ou marca real incorporado.

## Estrutura

```text
assets/
├── models/electrical/
│   ├── manifest.json
│   ├── workbench_lod0.glb
│   ├── workbench_lod1.glb
│   ├── workbench_lod2.glb
│   └── ...
├── textures/pbr/
└── colliders/electrical/

js/assets/
├── asset-manager.js
├── glb-loader-lite.js
├── procedural-fallbacks.js
└── texture-library.js
```

## Kit elétrico inicial

- bancada técnica;
- fonte CC regulável;
- multímetro digital;
- módulo resistivo;
- interruptor de alavanca;
- carga luminosa.

Cada item possui três GLBs, colisor e fallback. O pacote inicial contém 18 arquivos GLB e foi mantido abaixo de 700 KiB para permitir carregamento rápido em GitHub Pages.

## Loader GLB leve

O projeto inclui um parser local de GLB 2.0 para o subconjunto utilizado pelos assets próprios. Ele suporta:

- cenas e nós;
- matrizes e transformações TRS;
- posições, normais, UVs, cores e índices;
- materiais PBR básicos;
- cálculo de normais quando ausentes;
- sombras e caixas de seleção.

O loader não substitui permanentemente o `GLTFLoader` oficial. Animações, skins, Draco, Meshopt e KTX2 continuam planejados para uma etapa posterior.

## Texturas PBR

O kit inclui mapas procedurais locais de:

- metal escovado;
- borracha;
- cerâmica;
- superfície da bancada.

Cada conjunto possui base color, roughness e normal. Os mapas são aplicados por nome estável do material e usam repetição e anisotropia adaptadas ao dispositivo.

## LOD

- Econômico: prioriza LOD 2;
- Médio e Científico: priorizam LOD 1;
- Alto e Ultra: priorizam LOD 0.

A próxima evolução deverá permitir troca dinâmica conforme distância e pressão de memória.

## Geração reproduzível

`tools/generate_asset_pack.py` recria o pacote inicial com Trimesh e Pillow. O script existe para garantir repetibilidade e auditoria; modelos definitivos poderão ser substituídos por exports Blender mantendo os mesmos IDs e contratos.

## Bloqueio de qualidade

Um asset novo somente entra no manifesto quando possui:

1. escala verificada;
2. pivô útil para interação;
3. nomes estáveis;
4. LODs;
5. colisor;
6. materiais PBR;
7. fallback;
8. orçamento de tamanho;
9. teste estrutural;
10. validação visual em desktop e mobile.

## Integridade

`assets/models/electrical/asset-checksums.json` registra tamanho e SHA-256 de cada GLB, textura e colisor publicado.

## Expansão da Fase Visual 6 — v0.2.8

O kit foi ampliado para doze assets e trinta e seis GLBs. Foram adicionados amperímetro, voltímetro, porta-fusível, reostato, diodo e LED. O orçamento total dos GLBs ficou em aproximadamente 575 KiB, mantendo três LODs e colisores para todos os equipamentos.

Os novos nós interativos incluem:

- `DMM_DIAL_MAT_POLYMER_BLACK`;
- `FUSE_WIRE_MAT_METAL_COPPER`;
- `RHEO_SLIDER_MAT_ORANGE`;
- `LED_LENS_MAT_GLASS`.

O manifesto do pacote foi elevado para a versão 1.1.0.

## Atualização artística v0.3.7

O manifesto foi elevado para **1.2.0** e recebeu o grau `premium-procedural-v2`.

O pacote permanece com 12 assets e 36 GLBs, agora com aproximadamente **808 KiB**. Foram adicionados detalhes geométricos compatíveis com o orçamento web:

- parafusos e fixadores;
- molduras e proteção de visor;
- etiquetas e sinalização;
- escalas dos instrumentos;
- ventilação;
- marcações de polaridade;
- régua e tapete antiestático da bancada;
- peças internas selecionadas.

Os detalhes aparecem principalmente no LOD0 e de forma reduzida no LOD1. O LOD2 permanece econômico para cache inicial e aparelhos de menor capacidade.
