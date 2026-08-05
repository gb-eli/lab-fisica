# MECÂNICA, GRAVIDADE E DINÂMICA PREMIUM 360

## Versão

**v0.3.2 — Fase Visual 9**

## Objetivo

Transformar os conteúdos de Mecânica do Ensino Médio em experiências tridimensionais inspecionáveis, com câmera orbital, zoom, câmera lenta, vetores, gráficos e cálculos independentes da renderização.

## Arquitetura

- interface: `js/modules/mechanics.js`;
- cena 3D: `js/modules/mechanics3d.js`;
- motor científico: `js/science/mechanics.js`;
- estilo: `css/mechanics-lab.css`;
- rota: `#mechanics`.

O tempo científico é acumulado separadamente do FPS. A escala temporal pode ser alterada para 0,1×, 0,25×, 0,5×, 1× ou 2× sem alterar as equações.

## Experiência 1 — Dinâmica e atrito

A cena contém rampa técnica, carrinho com rodas, trilhos, escala e vetores tridimensionais.

Parâmetros:

- massa;
- inclinação;
- gravidade;
- coeficiente de atrito estático;
- coeficiente de atrito cinético;
- força aplicada.

Leituras:

- normal;
- componente paralela do peso;
- limite do atrito estático;
- atrito atuante;
- força resultante;
- aceleração;
- condição de equilíbrio ou movimento.

## Experiência 2 — Lançamentos

A cena contém lançador orientável, esfera, trajetória, alvo, vetor velocidade, vetor gravidade e rastro temporal.

Parâmetros:

- velocidade inicial;
- ângulo;
- altura inicial;
- massa;
- gravidade;
- arrasto linear.

Leituras:

- alcance;
- altura máxima;
- tempo de voo;
- velocidade de impacto;
- posição e velocidade instantâneas;
- energias cinética e potencial.

O arrasto é uma aproximação linear para comparação educacional. Não representa aerodinâmica turbulenta completa.

## Experiência 3 — Colisões

A cena contém pista, dois carrinhos com rodas, para-choques, vetores de velocidade e efeito visual de impacto.

Parâmetros:

- massas;
- velocidades iniciais;
- coeficiente de restituição.

Leituras:

- velocidades finais;
- momento antes e depois;
- energia cinética antes e depois;
- energia dissipada;
- classificação elástica, parcialmente inelástica ou perfeitamente inelástica.

## Experiência 4 — Oscilações

Dois sistemas compartilham a mesma estrutura laboratorial:

- pêndulo amortecido;
- massa-mola amortecida.

Parâmetros:

- massa;
- comprimento;
- ângulo inicial;
- constante elástica;
- amplitude;
- amortecimento;
- gravidade.

Leituras:

- posição ou ângulo;
- velocidade;
- período;
- frequência natural;
- regime de amortecimento;
- energia mecânica.

## Experiência 5 — Gravidade

A cena apresenta planeta, atmosfera quando aplicável, torre de queda, esfera, órbita e satélite.

Corpos disponíveis:

- Terra;
- Lua;
- Marte;
- Júpiter.

Parâmetros:

- altura de queda;
- velocidade vertical inicial;
- gravidade;
- altitude orbital.

Leituras:

- tempo de queda;
- velocidade de impacto;
- energia por unidade de massa;
- velocidade orbital;
- período orbital;
- aceleração centrípeta/gravitacional.

A órbita visual é acelerada para fins de observação, enquanto as leituras exibem o período físico calculado.

## Recursos gráficos

- arquitetura laboratorial fechada;
- materiais PBR procedurais;
- sombras adaptativas;
- iluminação física;
- environment map;
- pós-processamento opcional;
- resolução dinâmica;
- vetores tridimensionais;
- rastros e trajetórias;
- câmera orbital 360°;
- zoom por roda e pinça;
- câmera automática;
- tela cheia;
- gráficos em tempo real;
- fallback 2D.

## Acessibilidade

- controles em DOM;
- alternativa 2D;
- leituras textuais;
- fórmulas visíveis;
- redução de movimento;
- alto contraste;
- pausa completa;
- escalas temporais lentas;
- interface responsiva.

## Persistência e evidência

O laboratório salva localmente:

- experiência ativa;
- parâmetros;
- conclusão do estudante;
- leituras científicas.

A exportação JSON contém data, versão, modo, parâmetros e resultados.

## Limitações registradas

- ainda não utiliza Rapier;
- colisões são unidimensionais;
- o arrasto do projétil é linear;
- o pêndulo utiliza aproximação angular;
- objetos são procedurais detalhados, não assets Blender finais;
- não há colisão física entre o usuário e o cenário;
- a órbita visual usa compressão temporal;
- validação visual em aparelhos reais permanece necessária.
