# Relatório de validação — Física Imersiva 360 v0.4.7

## Escopo

Fase R8: portal inicial leve, carregamento dos laboratórios sob demanda, descarte de recursos, cache progressivo e sessão local do estudante.

## Implementação verificada

- rota inicial `home`;
- onze definições modulares de rota;
- imports dinâmicos para todos os laboratórios;
- CSS por rota;
- tela de carregamento sob demanda;
- cleanup assíncrono;
- verificação de runtimes após a saída;
- service worker dividido entre shell e laboratórios;
- limpeza manual do cache de laboratórios;
- sessão local com nome, turma e turno;
- troca e logout;
- exportação JSON e CSV;
- portal científico responsivo com fundo Canvas 2D.

## Testes automatizados

A suíte `npm test` foi aprovada integralmente. Permanecem aprovados:

- todos os motores científicos;
- instrumentação e solver elétrico;
- 36 modelos GLB;
- Hall e oito laboratórios;
- acessibilidade e roteiros pedagógicos;
- recuperação estrutural;
- R2, R3 e R4;
- playtest 2D R5;
- pré-teste WebGL R6;
- infraestrutura local-first R7A;
- novos contratos de modularização e sessão R8.

## Teste real em Chromium

Comando:

`xvfb-run -a python3 tools/modular_browser_test.py`

Perfis:

- desktop: 1365 × 768;
- celular: 390 × 844.

Resultados idênticos nos dois perfis:

- portal carregado sem erros;
- 21 requisições iniciais;
- nenhum módulo dos laboratórios no início;
- nenhum recurso pesado no início;
- nenhum canvas WebGL no início;
- zero CSS de rota no início;
- Eletrostática carregada por clique;
- Eletricidade carregada por clique;
- sessão iniciada e rotas registradas;
- CSS removido ao retornar;
- canvas removido ao retornar;
- runtime ativo após Eletrostática: zero;
- nenhum erro ou aviso de console;
- nenhum overflow horizontal.

O navegador foi executado em modo 2D seguro para isolar o ciclo de módulos e recursos. O teste não substitui validação de GPU.

## Auditoria de tamanho

### Grafo inicial

- JavaScript: 127.762 bytes;
- CSS: 68.712 bytes;
- total de código inicial: 196.474 bytes;
- 15 módulos JavaScript;
- 6 folhas de estilo;
- zero GLB;
- zero Three.js;
- zero módulo de laboratório.

### Projeto completo preservado

- JavaScript: 827.869 bytes, aproximadamente 808 KiB;
- CSS: 181.506 bytes, aproximadamente 177 KiB;
- GLB: 827.160 bytes, aproximadamente 808 KiB;
- 71 módulos JavaScript;
- 21 folhas de estilo;
- 36 arquivos GLB.

## Evidências

- `validation/r8-modular-browser.json`;
- `validation/r8-initial-shell.json`;
- capturas desktop e mobile em `validation/screenshots/`;
- `assets/module-manifest.json`;
- `assets/performance-budget.json`.

## Limitações

- Three.js local completo ainda não incorporado;
- WebGL das cenas completas não foi revalidado nesta fase;
- módulos ES importados não podem ser removidos do cache interno do navegador sem recarregar;
- autenticação é local, sem senha ou servidor;
- tempos podem ser apagados ou alterados por quem controla o navegador;
- testes físicos em celulares, tablets, Chromebooks e computadores escolares permanecem necessários.

## Resultado

**Aprovado para a arquitetura modular, carregamento sob demanda, descarte de runtimes, responsividade do portal e sessão local.**

A aprovação não representa validação final das GPUs físicas nem conclusão da R7B.

## Integridade final do pacote

- 34 arquivos JSON/webmanifest válidos;
- 26 referências do shell offline, nenhuma ausente;
- 112 arquivos JavaScript/MJS aprovados na verificação de sintaxe;
- 36 GLBs preservados;
- 308 arquivos antes da compactação.
