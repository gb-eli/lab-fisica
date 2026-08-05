# CATÁLOGO DE ASSETS ELÉTRICOS 3D

## Pacote atual — v0.2.8

O pacote contém **12 assets**, **36 arquivos GLB**, três LODs por equipamento, colisores JSON e fallback procedural.

| ID | Função | Detalhes interativos |
|---|---|---|
| `workbench` | Ambiente técnico | tampo, painel, pernas, gavetas e prateleira |
| `power-supply` | Fonte CC | knobs de tensão/corrente, bornes, display e modo CV/CC |
| `multimeter` | Instrumento multifunção | seletor, display, COM, VΩ e A |
| `ammeter` | Medição de corrente | display e ligação em série |
| `voltmeter` | Medição de tensão | display e ligação em paralelo |
| `fuse-module` | Proteção | cápsula transparente e fio fusível visível |
| `resistor-module` | Carga resistiva | corpo cerâmico, faixas, terminais e aquecimento |
| `rheostat` | Resistência variável | cursor deslizante, espiras e terminais |
| `toggle-switch` | Comando | alavanca animada e terminais |
| `lamp-load` | Carga luminosa | bulbo, filamento e emissão térmica |
| `diode-module` | Semicondutor | corpo, faixa de cátodo, terminais e polaridade |
| `led-module` | Emissor | lente, emissor, terminais e brilho por corrente |

## Convenções

- unidades em metros;
- eixo vertical Y;
- frente -Z;
- materiais nomeados com prefixo `MAT_`;
- pivôs preparados para interação;
- LOD 0 alto, LOD 1 médio e LOD 2 econômico;
- colisores em `assets/colliders/electrical/`;
- manifesto em `assets/models/electrical/manifest.json`;
- geração reproduzível por `tools/generate_asset_pack.py`.

## Próximos assets

- breadboard;
- bateria;
- capacitores;
- indutores;
- potenciômetro;
- motor CC;
- relé;
- osciloscópio;
- gerador de funções;
- transformador;
- conectores mecânicos finais.

## Acabamento premium v2 — v0.3.7

Todos os equipamentos do catálogo foram regenerados com o contrato `premium-procedural-v2`. O conjunto possui 36 GLBs e aproximadamente 808 KiB.

Detalhes incorporados conforme o equipamento:

- molduras de painel;
- parafusos;
- escalas e ticks;
- etiquetas de tensão, corrente, risco e temperatura;
- marcações de anodo, catodo, COM e entradas;
- ventilação e acabamento lateral;
- clipes do fusível;
- peças internas do LED;
- superfície antiestática da bancada.

A natureza dos assets continua sendo procedural e reproduzível. Eles não são apresentados como modelos Blender manuais finais.
