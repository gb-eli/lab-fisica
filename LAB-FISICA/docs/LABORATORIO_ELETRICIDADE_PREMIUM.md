# LABORATÓRIO PILOTO DE ELETRICIDADE PREMIUM 360

**Versão:** 0.2.9  
**Fase:** Visual 7  
**Estado:** implementação funcional de referência

## Objetivo

Transformar a bancada elétrica em um laboratório completo para montagem, comparação e diagnóstico de redes resistivas, preservando o padrão visual 3D/360°, a separação entre cálculo científico e renderização e a compatibilidade com GitHub Pages.

## Topologias funcionais

### Série

- R1 e R2 no mesmo caminho elétrico;
- corrente igual nos dois componentes;
- divisão de tensão proporcional às resistências;
- resistência equivalente calculada pela soma.

### Paralelo

- R1 e R2 ligados aos mesmos nós;
- tensão igual nos dois ramos;
- corrente total calculada pela soma das correntes dos ramos;
- resistência equivalente pelo inverso da soma das condutâncias.

### Misto

- R1 em série com o paralelo formado por R2 e R3;
- divisão de corrente no nó posterior a R1;
- validação de `I1 = I2 + I3`;
- cálculo de tensão, corrente e potência para cada componente.

## Motor científico

Arquivo: `js/science/resistive-network.js`.

O motor utiliza análise nodal para redes resistivas com uma fonte de tensão conhecida e referência de terra. A matriz de condutâncias é resolvida por eliminação gaussiana com pivotamento.

O resultado inclui:

- tensões nodais;
- corrente total;
- resistência equivalente;
- tensão por ramo;
- corrente por ramo;
- potência por componente;
- potência total;
- estado CV ou CC da fonte;
- circuito desconectado;
- resistência próxima de curto.

## Modos científicos

### Ideal

- resistores exatamente iguais aos valores programados;
- contatos sem resistência;
- ausência de tolerância.

### Realista

- pequenas tolerâncias determinísticas;
- resistência de contato;
- influência térmica introdutória;
- resultados reproduzíveis.

### Experimental

- tolerância ampliada;
- contatos mais perceptíveis;
- aviso explícito de variação experimental;
- indicado para comparar valor nominal e valor efetivo.

## Representação tridimensional

A bancada apresenta:

- três módulos resistivos GLB;
- displays locais para R1, R2 e R3;
- valores, correntes e tensões atualizados nos próprios componentes;
- cabos tridimensionais diferentes em cada topologia;
- partículas de corrente somente quando o circuito está energizado e completo;
- aquecimento visual individual calculado pela potência de cada resistor;
- foco de câmera em cada componente;
- câmera orbital e zoom;
- materiais PBR, sombras e iluminação compartilhada.

R3 permanece oculto em série e paralelo e é ativado fisicamente no circuito misto.

## Construtor e catálogo

O painel permite:

- selecionar série, paralelo ou misto;
- adicionar o terceiro ramo;
- duplicar o valor de R2 em R3;
- remover o terceiro ramo;
- modificar R1, R2 e R3;
- alternar entre modelo ideal, realista e experimental;
- manipular a posição e a rotação dos equipamentos;
- refazer ligações pelos terminais.

O catálogo atual é intencionalmente limitado a redes resistivas. Capacitores, indutores e fontes alternadas serão incorporados em fases posteriores com motores científicos próprios.

## Instrumentos

Continuam funcionais:

- fonte CC em CV/CC;
- amperímetro em série;
- voltímetro em paralelo;
- multímetro em tensão, corrente, resistência e continuidade;
- fusível do circuito;
- fusível interno do multímetro;
- diagnóstico de bornes e ligações incorretas.

## Práticas guiadas

### Corrente igual em série

1. selecionar série;
2. energizar o circuito;
3. validar igualdade das correntes de R1 e R2.

### Tensão igual em paralelo

1. selecionar paralelo;
2. energizar os ramos;
3. validar igualdade das tensões de R1 e R2.

### Lei dos Nós no circuito misto

1. selecionar misto;
2. energizar R1 e os ramos R2/R3;
3. validar `I1 = I2 + I3`.

A conclusão é calculada pelo motor científico, e não por simples clique.

## Evidências

### JSON

Inclui:

- versão;
- data e hora;
- topologia;
- modo científico;
- resistores;
- fonte e limite de corrente;
- rede resolvida;
- ramos;
- instrumentos;
- alertas;
- fusíveis;
- prática selecionada;
- validação das etapas;
- transformações e cabos da bancada.

### CSV

Inclui uma linha por ramo com:

- resistência;
- tensão;
- corrente;
- potência.

## Limitações atuais

- o construtor trabalha com três resistores e três topologias definidas;
- ainda não há editor nodal totalmente livre;
- cabos não possuem física de gravidade ou colisão;
- instrumentos usam modelos educacionais, não certificação metrológica;
- os modelos GLB ainda são procedurais detalhados;
- a validação visual final deve ser feita em aparelhos reais.

## Próxima evolução

A próxima fase visual deverá levar o mesmo padrão para eletromagnetismo e energia, incluindo bobinas, ímãs, motores, geradores, campos vetoriais, rotação mecânica e transferência de energia em 3D/360°.
