# RELATÓRIO DE VALIDAÇÃO — v0.2.9

## Escopo

Fase Visual 7 — Laboratório Piloto de Eletricidade Premium 360.

## Testes científicos

- circuito em série com resistência equivalente correta;
- igualdade de corrente nos componentes em série;
- divisão de tensão em série;
- circuito em paralelo com resistência equivalente correta;
- igualdade de tensão nos ramos paralelos;
- soma das correntes em paralelo;
- circuito misto com R1 em série com R2 paralelo a R3;
- Lei dos Nós no circuito misto;
- limitação de corrente e transição CV/CC;
- modo realista diferente do ideal;
- potência por componente e potência total.

## Testes estruturais

- módulo `resistive-network.js` disponível;
- três topologias presentes no módulo de bancada;
- três resistores tridimensionais presentes;
- cabos específicos por topologia;
- tabela de ramos;
- práticas guiadas;
- exportação JSON;
- exportação CSV;
- persistência local;
- integração com instrumentos e interação universal;
- arquivo incluído no cache PWA.

## Compatibilidade

Verificado por:

- validação de sintaxe JavaScript;
- execução dos testes Node;
- servidor HTTP estático local;
- verificação de referências locais;
- validação de JSON;
- teste de integridade do ZIP.

## Limitação de validação visual

A inspeção automatizada com navegador gráfico não é considerada conclusiva neste ambiente. A matriz final deve ser testada manualmente em:

- Android;
- iPhone;
- tablet;
- Chromebook;
- notebook com mouse;
- monitor de baixa e alta resolução.

## Resultado

A Fase Visual 7 atende ao contrato científico e estrutural planejado. A validação visual e tátil em aparelhos reais permanece como etapa de publicação.

## Fechamento do pacote

- testes automatizados: aprovados;
- módulos JavaScript e MJS: sintaxe aprovada;
- arquivos JSON validados: 17;
- arquivos GLB preservados: 36;
- arquivos incluídos no pacote: 147;
- servidor HTTP local: arquivos principais responderam corretamente;
- integridade do ZIP: aprovada pelo `unzip -t`.

A tentativa de inspeção automatizada com Chromium não gerou uma página verificável devido a falhas de DBus e do subsistema gráfico do ambiente. Esse resultado não foi contabilizado como validação visual.
