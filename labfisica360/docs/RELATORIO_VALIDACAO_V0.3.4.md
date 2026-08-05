# Relatório de Validação — Física Imersiva 360 v0.3.4

## Escopo

Validação da Fase Visual 11 — Termologia, Gases e Fluidos Premium 360 — e regressão integral dos laboratórios existentes.

## Resultado geral

**Aprovado nos testes científicos, estruturais e de publicação estática.**

## Testes científicos aprovados

- conversão Celsius–Kelvin;
- calor sensível;
- equilíbrio calorimétrico e balanço de energia;
- calor latente;
- dilatação linear;
- condução;
- convecção;
- radiação térmica;
- fusão parcial e frações de fase;
- gás ideal;
- processo isotérmico;
- pressão hidrostática;
- empuxo e peso;
- continuidade;
- Bernoulli;
- Torricelli;
- Reynolds;
- Poiseuille;
- máquina térmica e limite de Carnot;
- refrigeração e limite de COP.

## Testes de integração aprovados

- rota `thermal` registrada;
- aba Termofluidos presente no dock;
- tema Termologia e Fluidos registrado;
- oitavo setor adicionado ao Hall;
- prévia térmica do Hall registrada;
- seis construtores 3D presentes;
- câmera orbital e runtime compartilhado utilizados;
- interface mobile e fallback 2D presentes;
- salvamento e exportação de evidência presentes;
- cache offline atualizado;
- manifesto atualizado para 0.3.4.

## Regressão

A suíte `npm test` foi executada integralmente. Permaneceram aprovados:

- Eletrostática;
- instrumentos elétricos;
- redes resistivas;
- Física Avançada conceitual;
- Design System;
- núcleo gráfico;
- pipeline GLB;
- Hall Premium;
- sistema universal de interação;
- Eletricidade Premium;
- Eletromagnetismo;
- Energia;
- Mecânica;
- Ondas, Som e Óptica;
- integridade estática.

## Publicação estática

- todos os módulos JavaScript passaram em `node --check`;
- 18 arquivos JSON/webmanifest foram analisados;
- 93 referências do cache offline foram localizadas;
- nenhum arquivo do cache ficou ausente;
- `index.html`, `js/app.js`, motor científico, módulos 3D, CSS e manifesto responderam HTTP 200 em servidor local.

## Limitação da validação visual automatizada

O Chromium headless do ambiente não gerou DOM ou captura utilizável. O processo permaneceu bloqueado por falhas de DBus e do subsistema gráfico. Portanto, não foi feita alegação de validação visual em GPU real.

Ainda é necessária inspeção manual em:

- celular Android;
- iPhone ou iPad;
- Chromebook;
- notebook com GPU integrada;
- computador com perfil Alto ou Ultra.

## Limitações científicas e gráficas

- modelos térmicos concentrados e unidimensionais;
- ausência de CFD completo;
- gás ideal;
- propriedades médias da água;
- Bernoulli sem todas as perdas distribuídas e localizadas;
- máquinas térmicas educacionais;
- equipamentos procedurais, não GLBs Blender finais.

## Empacotamento

- 187 arquivos de projeto verificados antes do empacotamento;
- 216 entradas no ZIP, incluindo diretórios;
- teste `unzip -t` concluído sem erros;
- pacote completo gerado como `fisica-imersiva-360-v0.3.4.zip`.
