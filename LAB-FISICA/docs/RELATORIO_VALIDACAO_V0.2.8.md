# RELATÓRIO DE VALIDAÇÃO — v0.2.8

## Escopo

Validação da Fase Visual 6 — Instrumentos e Componentes Realistas.

## Testes científicos aprovados

- Lei de Ohm com resistência interna do modelo;
- operação CV da fonte;
- operação CC por limite de corrente;
- medição de tensão em paralelo;
- medição de corrente em série;
- erro de amperímetro em paralelo;
- fusível interno do multímetro;
- resistência em circuito energizado;
- continuidade abaixo do limiar;
- polaridade reversa de LED;
- atuação do fusível do circuito;
- potência, energia e temperatura.

## Pipeline 3D

- 12 assets registrados;
- 36 arquivos GLB 2.0;
- três LODs por asset;
- 12 colisores JSON;
- materiais com contrato `MAT_*`;
- nós interativos conferidos;
- tamanho total dos GLBs: aproximadamente 575,3 KiB;
- manifesto do pacote: versão 1.1.0;
- checksums SHA-256 atualizados.

## Testes estruturais aprovados

- sintaxe de todos os módulos JavaScript;
- eletrostática;
- Física Avançada;
- Design System;
- núcleo gráfico;
- pipeline de assets;
- Hall Premium;
- sistema universal de interação;
- instrumentação elétrica;
- integridade estática;
- versões e manifestos;
- arquivos do cache PWA.

## Publicação estática

Foram verificados por servidor HTTP local:

- `index.html`;
- motor científico de instrumentação;
- arquivo GLB do amperímetro;
- 72 referências do cache offline, sem arquivos ausentes.

## Limitações da validação

A validação automatizada confirma estrutura, modelos matemáticos, arquivos, contratos e carregamento HTTP. A inspeção visual final de sombras, toque, legibilidade dos displays, desempenho e manipulação 360° ainda deve ser repetida em celular e computador reais.

## Resultado

A Fase Visual 6 está aprovada como implementação funcional de referência, com limitações claramente documentadas.
