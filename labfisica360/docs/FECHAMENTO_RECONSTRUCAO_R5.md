# Fase R5 — Playtest, dispositivos e fechamento da reconstrução

**Versão:** 0.4.4  
**Escopo:** estabilidade, UX/UI, navegação e validação real em navegador.

## Objetivo

Encerrar a reconstrução R1–R5 com testes que exercitam a aplicação como interface, e não apenas como coleção de fórmulas e arquivos. A fase não cria novos laboratórios.

## Defeitos reproduzidos e corrigidos

### Limpeza de rotas

Mecânica, Ondas e Termofluidos utilizavam `disposed` durante a conclusão assíncrona e no cleanup sem declarar a variável. A troca rápida de rotas podia gerar `ReferenceError`, manter animações vivas e deixar controles em estado inconsistente.

Correção:

- declaração explícita do estado de descarte;
- descarte seguro de APIs carregadas depois da saída;
- regressão por troca rápida entre laboratórios.

### Botão Apoio sem clique

As cinco visualizações do workspace ocupavam uma coluna menor do que a soma das larguras mínimas. O botão **Apoio** invadia a área de estado e tinha o clique interceptado.

Correção:

- identidade, cenário e estado na primeira linha;
- Laboratório, Cena, Controles, Resultados e Apoio em uma linha própria;
- layout adaptado a desktop e mobile.

### HUD duplicado

O indicador flutuante do roteiro cobria títulos e partes da cena. A plataforma já possui Progresso na barra superior e no dock.

Correção:

- HUD flutuante removido da visualização normal;
- progresso preservado nos dois acessos existentes.

### Catálogo denso

O catálogo utilizava cartões estreitos e ações espremidas.

Correção:

- três colunas em desktop amplo;
- duas colunas em telas intermediárias;
- uma coluna no celular;
- ações flexíveis e trilha com quebra controlada.

### Isolamento de falhas de UI

Uma exceção em `afterNavigate` podia deixar a view ocupada e comprometer a navegação seguinte.

Correção:

- proteção por `try/catch/finally`;
- remoção garantida de `aria-busy`;
- evento `fisica:route-ready`;
- evento `fisica:app-ready`;
- rota atual exposta em `body.dataset.currentRoute` para diagnóstico e testes.


### Posição da rota e Hall 2D

A troca de rota preservava a rolagem da tela anterior. Em telas longas, o próximo laboratório podia abrir no meio do conteúdo, escondendo título e objetivo. O Hall 2D também mantinha rótulos decorativos orbitais que competiam com a trilha lateral.

Correção:

- retorno automático ao topo após cada navegação;
- `scrollTop` da view reiniciado;
- rótulos orbitais removidos no fallback 2D;
- badge e títulos laterais passam a quebrar linha sem corte.

## Smoke test em navegador

Foi criado `tools/browser_smoke_test.py`.

O teste:

- empacota os módulos ES em memória;
- respeita a ordem real das folhas de estilo;
- abre a aplicação em Chromium sem servidor HTTP;
- usa o modo seguro 2D;
- testa 10 rotas;
- troca as cinco visualizações;
- altera cenários;
- aciona reinícios visíveis;
- executa trocas rápidas de rota;
- abre Configurações;
- verifica erros de página e console;
- verifica overflow visível;
- captura desktop 1365×768;
- captura mobile 390×844.

## Resultado

- 2 perfis aprovados;
- 20 combinações rota × perfil aprovadas;
- 80 trocas de visualização, 14 mudanças de cenário e 13 reinícios visíveis;
- nenhum `route-error`;
- nenhuma exceção de página;
- nenhum erro de console;
- nenhum overflow visível fora de contêineres de rolagem;
- Configurações abertas nos dois perfis;
- limpeza rápida entre rotas aprovada.

## Limite da aprovação

O teste valida interface, fallback 2D, rotas e comportamento DOM. Ele não substitui:

- WebGL em hardware real;
- sombras e materiais;
- pinça e toque físico;
- aquecimento e bateria;
- desempenho prolongado;
- inspeção dos modelos GLB em diferentes GPUs.
