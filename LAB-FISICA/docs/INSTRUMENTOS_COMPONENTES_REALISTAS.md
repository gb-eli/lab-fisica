# FASE VISUAL 6 — INSTRUMENTOS E COMPONENTES REALISTAS

## Versão de referência

Física Imersiva 360 v0.2.8.

## Objetivo

Transformar a bancada elétrica em um laboratório de instrumentação 3D/360° com comportamento científico, estados de segurança e equipamentos visualmente identificáveis. Os instrumentos não são apenas objetos decorativos: a leitura, o visor, os seletores, os bornes, a proteção e os alertas dependem do circuito e da configuração escolhida.

## Equipamentos 3D

O pacote elétrico passou de seis para doze assets, todos em GLB 2.0, metros, eixo Y, três LODs, colisor JSON e fallback procedural:

1. bancada técnica;
2. fonte CC regulável;
3. multímetro digital;
4. amperímetro dedicado;
5. voltímetro dedicado;
6. porta-fusível transparente;
7. resistor cerâmico;
8. reostato deslizante;
9. interruptor;
10. lâmpada;
11. diodo;
12. LED.

## Realismo visual

- câmera orbital 360°;
- zoom e foco individual;
- quatro visores CanvasTexture atualizados em tempo real;
- seletor do multímetro animado;
- controles da fonte animados;
- cursor do reostato animado;
- fusível visível em estado íntegro ou aberto;
- aquecimento do resistor por emissão térmica;
- brilho de lâmpada e LED dependente da potência/corrente;
- cabos tridimensionais seguindo os equipamentos;
- terminais com capacidade de derivação para medições em paralelo;
- iluminação PBR, sombras, environment map e pós-processamento adaptativo.

## Modelo científico

Arquivo central: `js/science/electrical-instruments.js`.

O motor calcula:

- resistência efetiva;
- tensão programada e tensão de saída;
- corrente solicitada;
- operação CV ou CC da fonte;
- potência na carga;
- energia;
- temperatura aproximada;
- tensão direta de LED e diodo;
- bloqueio por polaridade reversa;
- atuação do fusível por sobrecorrente e tempo;
- fusível interno do multímetro;
- erros de borne e topologia;
- precisão e incerteza dos instrumentos.

## Fonte regulável

A fonte possui:

- tensão de 0 a 24 V;
- limite de corrente;
- modo CV quando a carga não exige corrente acima do limite;
- modo CC quando o limite é atingido;
- display de tensão, corrente e modo;
- indicação visual de atenção em CC.

## Multímetro

Funções:

- tensão CC;
- corrente CC;
- resistência;
- continuidade.

Bornes:

- COM;
- VΩ;
- A.

Topologias guiadas:

- paralelo à carga;
- paralelo à fonte;
- série;
- componente isolado;
- pontas desconectadas.

Erros modelados:

- amperímetro em paralelo;
- tensão com ponta no borne A;
- corrente com ponta no borne VΩ;
- resistência em circuito energizado;
- medição em topologia incorreta;
- fusível interno aberto.

## Fusíveis

Existem dois sistemas independentes:

- fusível do circuito;
- fusível do multímetro.

O fusível do circuito utiliza uma curva simplificada dependente da razão entre corrente e corrente nominal. O objetivo é demonstrar que uma pequena sobrecorrente pode exigir mais tempo, enquanto um curto intenso atua rapidamente.

## Componentes semicondutores

### LED

- tensão direta aproximada;
- polaridade direta ou reversa;
- emissão dependente da corrente;
- corrente limitada pela resistência do circuito;
- bloqueio no sentido reverso no modelo didático.

### Diodo

- queda direta aproximada;
- bloqueio reverso;
- indicação de polaridade.

## Reostato

O valor selecionado é somado à resistência em série. O cursor 3D acompanha a configuração numérica.

## Segurança

Todos os curtos e falhas são virtuais e limitados pelo modelo. A plataforma não orienta o estudante a reproduzir ligações perigosas em bancada real.

## Acessibilidade

- todos os parâmetros também existem em controles DOM;
- leituras possuem texto, estado e unidade;
- alertas não dependem apenas de cor;
- existe fallback 2D;
- os componentes podem ser escolhidos por lista para foco de câmera;
- redução de movimento desativa pulsos não essenciais.

## Critérios atendidos

- [x] multímetro com seletor;
- [x] bornes COM, VΩ e A;
- [x] amperímetro e voltímetro dedicados;
- [x] fonte CV/CC;
- [x] fusíveis e recuperação;
- [x] erros de ligação;
- [x] incerteza instrumental;
- [x] LED, diodo e reostato;
- [x] displays e animações mecânicas;
- [x] inspeção 360°;
- [x] testes científicos.

## Próxima fase

Fase Visual 7 — Laboratório Piloto de Eletricidade Premium, com construtor de circuitos em série, paralelo e misto, componentes duplicáveis, instrumentos livres, práticas guiadas, falhas controladas e evidências exportáveis.
