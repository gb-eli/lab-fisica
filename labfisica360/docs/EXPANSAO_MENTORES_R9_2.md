# Expansão dos Mentores Históricos — Fase R9.2

## Objetivo

Ampliar o Modo Guiado sem aumentar o peso da tela inicial e sem duplicar a lógica científica dos laboratórios. O roteiro identifica controles reais já existentes, revela a área necessária e valida a ação realizada pelo estudante.

## Mentores disponíveis

1. Albert Einstein — luz, movimento, energia e interpretação;
2. Isaac Newton — forças, energia e relações matemáticas;
3. Michael Faraday — experimentos, campos, circuitos e ondas;
4. Marie Curie — medição, energia e evidências experimentais;
5. Nikola Tesla — sistemas elétricos, ressonância e transmissão;
6. Galileu Galilei — observação, movimento e experimentação.

As orientações são descritas como **inspiradas na obra e no contexto histórico**. O sistema não inventa citações, não imita falas e não afirma representar literalmente o pensamento pessoal dessas figuras.

## Cobertura

- 6 mentores;
- 8 laboratórios cobertos;
- 5 laboratórios ordenados em cada trilha principal;
- 33 combinações mentor × laboratório disponíveis;
- 138 etapas;
- 138 seletores de interface validados.

## Modularização

O conteúdo foi dividido em:

- `mentor-catalog.js`: identidade, áreas e ordem das trilhas;
- `foundation-tracks.js`: roteiros originalmente implementados na R9.1;
- `expansion-tracks.js`: novos mentores e novos laboratórios;
- `step-builders.js`: contratos de clique, entrada, mudança e observação;
- `core-tracks.js`: agregador das trilhas;
- `mentor-controller.js`: progresso, sessão, HUD e navegação;
- `highlight-engine.js`: revelação e destaque acessível;
- `step-validator.js`: validação dos eventos.

Nenhum desses módulos entra no grafo inicial. Eles são importados somente quando o estudante abre o seletor de mentores ou já possui uma trilha ativa.

## Experiência do estudante

- Modo Livre continua padrão;
- escolha opcional do mentor;
- cinco experiências recomendadas por trilha;
- destaque com contorno, seta, texto e foco;
- abertura automática de Cena, Controles ou Resultados;
- validação de clique, `input`, `change` ou checkpoint manual;
- dica e leitura por voz mediante ação explícita;
- salvamento e retomada local;
- mudança para Modo Livre a qualquer momento;
- registro na sessão do estudante.

## Acessibilidade

- destaque não depende apenas de cor;
- foco por teclado;
- rolagem até o alvo;
- redução de movimento respeitada;
- painel reposicionado para não bloquear o controle;
- HUD recolhido ao retornar ao Modo Livre;
- textos curtos e observação separada da instrução.
