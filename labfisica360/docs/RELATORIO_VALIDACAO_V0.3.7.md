# Relatório de Validação — Física Imersiva 360 v0.3.7

## Escopo

Fase Visual 14: refinamento artístico transversal, controles de câmera para toque, pacote elétrico premium procedural v2 e ferramenta local de validação por dispositivo.

## Resultado da regressão

A suíte completa `npm test` foi executada e aprovada. Foram preservados:

- todos os motores científicos;
- todas as rotas e laboratórios anteriores;
- Hall Científico 360;
- Eletricidade Premium e seu sistema universal de interação;
- Energia, Mecânica, Ondas, Termofluidos, Eletromagnetismo e Física Avançada;
- exportações, armazenamento local e fallback 2D.

## Assets e acabamento artístico

- 12 equipamentos elétricos validados;
- 36 arquivos GLB 2.0 validados;
- três LODs por equipamento;
- aproximadamente 807,8 KiB de GLB;
- colisores e nomes interativos preservados;
- novos parafusos, molduras, marcações, escalas, etiquetas, ventilação e detalhes técnicos detectados;
- materiais PBR físicos e iluminação de inspeção integrados ao runtime compartilhado;
- oito cenas WebGL conectadas à barra universal de câmera.

## Câmera e controles

Foram verificados estruturalmente:

- órbita com inércia;
- zoom suavizado;
- pinça;
- deslocamento do alvo com dois dedos;
- toque duplo para restaurar a câmera;
- teclado e barra móvel de assistência;
- bloqueio e retomada compatíveis com o ciclo de vida das cenas.

## Matriz de aparelhos

A ferramenta local inclui:

- diagnóstico de viewport e WebGL;
- verificação de alvos de toque;
- armazenamento, tela cheia e service worker;
- critérios manuais de visual, toque, legibilidade, orientação, temperatura e bateria;
- classificação aprovado, com ressalvas ou reprovado;
- histórico local;
- exportações JSON e CSV.

## Auditoria estática

Resultados de `npm run audit:performance`:

- JavaScript: 627.405 bytes, aproximadamente 613 KiB;
- CSS: 116.140 bytes, aproximadamente 113 KiB;
- GLB: 827.160 bytes, aproximadamente 808 KiB;
- maior módulo JavaScript: 61.209 bytes;
- 19 arquivos JSON/webmanifest válidos;
- todos os orçamentos estáticos aprovados.

## Publicação e cache

- 102 referências no núcleo do service worker;
- nenhuma referência offline ausente;
- `index.html`, aplicação, runtime, refinamento artístico, matriz de aparelhos, estilos e orçamento responderam HTTP 200;
- sintaxe dos módulos JavaScript aprovada.

## Tentativa de validação em navegador

Foi tentada a inicialização do Chromium headless em modo 2D seguro. O processo encerrou por timeout sem produzir DOM ou captura utilizável. O log registrou indisponibilidade do DBus e falhas do subsistema gráfico do ambiente.

Esse resultado não foi tratado como validação visual. Permanecem obrigatórios testes em aparelhos reais para:

- temperatura do dispositivo;
- consumo de bateria;
- conforto dos gestos;
- qualidade percebida das sombras e materiais;
- legibilidade em telas físicas;
- notch e barras do sistema;
- estabilidade prolongada;
- comparação dos perfis Baixo, Médio, Alto e Ultra.

## Resultado

**Aprovado para publicação como v0.3.7 quanto à ciência, estrutura, assets, integridade estática e distribuição. A coleta da matriz física por dispositivo permanece explicitamente pendente.**
