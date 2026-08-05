# Relatório de Validação — Física Imersiva 360 v0.3.6

## Escopo

Fase Visual 13 — Otimização multiplataforma, ciclo de vida, recuperação WebGL, diagnóstico transversal e validação de coerência científica.

## Implementações verificadas

- monitor de FPS e tempo de quadro com percentil 95;
- classificação estável, limitada e crítica;
- resolução dinâmica com histerese;
- níveis adaptativos para pontos, instâncias, sombras, detalhes e pós-processamento;
- suspensão automática de cenas ocultas ou fora de vista;
- retomada sem salto temporal;
- recuperação de contexto WebGL com interface própria;
- registro central das métricas de runtimes ativos;
- diagnóstico local e exportação JSON;
- pré-carregamento ocioso e liberação explícita de assets;
- descarte ampliado de recursos gráficos;
- auditoria estática reproduzível;
- manutenção da independência entre ciência e FPS.

## Testes automatizados

A suíte inclui testes científicos de todas as áreas anteriores, contratos premium, integridade estática e o novo teste `performance-optimization.test.mjs`.

## Critérios de publicação

- sintaxe JavaScript válida;
- todos os testes aprovados;
- versões e manifestos sincronizados;
- arquivos do service worker existentes;
- orçamento estático dentro dos limites definidos;
- rotas principais respondendo por HTTP;
- ZIP íntegro;
- SHA-256 gerado.

## Resultados finais

- suíte `npm test`: aprovada;
- JavaScript: aproximadamente 593 KiB;
- CSS: aproximadamente 110 KiB;
- GLB: aproximadamente 575 KiB;
- arquivos JSON/webmanifest válidos: 19;
- referências do cache offline: 98;
- referências ausentes no cache: 0;
- arquivos principais testados por HTTP: 200;
- maior módulo JavaScript: `js/modules/ohm.js`, aproximadamente 60 KiB;
- orçamentos estáticos: todos aprovados.

## Validação visual

Foram tentadas inicialização WebGL com SwiftShader e inicialização sem GPU. O Chromium encerrou por timeout, com falhas de DBus, EGL e ANGLE, sem produzir captura ou DOM utilizável. Portanto, a versão é validada estrutural, científica e estaticamente, mas ainda requer testes visuais em:

- celular Android intermediário;
- celular de entrada;
- tablet;
- Chromebook;
- notebook com GPU integrada;
- computador com GPU dedicada.

## Resultado

**Aprovado para publicação como v0.3.6, com validação visual e tátil em hardware real registrada como pendência obrigatória.**
