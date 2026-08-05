# Otimização e Validação Transversal — Física Imersiva 360

Implementação funcional: **v0.3.6 — Fase Visual 13**.

## Objetivo

Garantir que os laboratórios 3D/360° mantenham coerência científica, legibilidade e estabilidade em celulares, tablets, Chromebooks e computadores com capacidades gráficas diferentes. A otimização não pode alterar fórmulas, medições, gráficos ou resultados físicos.

## Camadas implementadas

### Monitor de desempenho ampliado

O núcleo registra:

- FPS médio;
- FPS de baixa sustentação;
- tempo médio de quadro;
- percentil 95 do tempo de quadro;
- draw calls;
- triângulos, pontos e linhas;
- geometrias;
- texturas;
- programas gráficos;
- escala dinâmica;
- estado estável, limitado ou crítico.

### Otimizador adaptativo de cena

Quatro níveis são selecionados com histerese para impedir oscilações frequentes:

- `full`;
- `balanced`;
- `reduced`;
- `minimal`.

O sistema ajusta somente a apresentação:

- quantidade desenhada em nuvens de pontos;
- quantidade ativa de instâncias;
- detalhes explicitamente marcados por nível;
- sombras;
- pós-processamento;
- resolução interna.

Os motores científicos continuam executando com os mesmos parâmetros.

### Suspensão de cenas

A renderização é pausada quando:

- a guia fica oculta;
- o laboratório sai da área visível;
- a rota é desmontada.

Ao retornar, o tempo de quadro é reiniciado para evitar saltos de simulação.

### Recuperação WebGL

Em perda de contexto:

- a animação é interrompida com segurança;
- uma camada de recuperação é apresentada;
- o navegador tenta restaurar o contexto;
- métricas e resolução são reiniciadas;
- após falha prolongada, o fallback é indicado;
- existe botão para recarregar o laboratório.

### Ciclo de vida de assets

O gerenciador de assets passou a oferecer:

- pré-carregamento durante tempo ocioso;
- liberação explícita de instâncias;
- contagem de fontes, cache e instâncias;
- cancelamento de carregamentos;
- descarte de geometrias, materiais, texturas, uniforms e bone textures.

### Diagnóstico integrado

As configurações agora exibem um relatório local com:

- recursos estimados do aparelho;
- viewport e densidade de pixels;
- perfil gráfico;
- orçamento ativo;
- métricas da cena atual;
- nível adaptativo;
- indicação de estabilidade;
- exportação em JSON.

Nenhuma informação é enviada para servidores.

## Orçamentos

Os perfis possuem metas distintas de FPS, draw calls, triângulos, densidade de pixels, sombras, partículas e pós-processamento. Esses valores são limites operacionais, não garantias universais, pois dependem do navegador, GPU, temperatura e uso simultâneo do aparelho.

O arquivo `assets/performance-budget.json` contém a auditoria estática reproduzível do pacote.

## Contrato de coerência científica

1. o motor científico recebe os parâmetros da atividade;
2. o resultado é calculado sem consultar FPS ou nível gráfico;
3. gráficos e instrumentos recebem o mesmo estado calculado;
4. a cena recebe esse estado apenas para representar posição, cor, movimento, intensidade ou falha;
5. otimizações podem reduzir amostras visuais, mas não valores físicos.

## Limitações

- métricas reais dependem de execução em hardware real;
- a auditoria estática não substitui profiling de GPU;
- não foi possível executar captura WebGL confiável no Chromium do ambiente;
- SpectorJS não foi incorporado ao pacote de produção;
- modelos procedurais detalhados continuam presentes;
- validação visual e tátil em aparelhos reais permanece obrigatória.
