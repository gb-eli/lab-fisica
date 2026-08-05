# Relatório de Validação — Física Imersiva 360 v0.3.8

## Escopo

Fase Visual 15: aprendizagem guiada, acessibilidade pedagógica, retomada local, evidência consolidada e matriz de validação por laboratório e perfil gráfico.

## Implementado

- roteiro para dez rotas;
- quatro checkpoints por rota;
- HUD compacto;
- diálogo de progresso;
- tutorial interativo;
- destaque contextual;
- detecção de exploração, parâmetros e ações significativas;
- conclusão escrita;
- tempo ativo;
- salvamento e retomada;
- exportação JSON;
- instruções simplificadas;
- alvos de toque ampliados;
- foco forte;
- rótulos persistentes;
- leitura do objetivo sob demanda;
- matriz de oito laboratórios por quatro perfis;
- exportação da matriz em JSON e CSV.

## Testes automatizados

- dez guias presentes;
- quatro checkpoints únicos em cada guia;
- cálculo de progresso geral;
- conclusão de rota;
- evidência por rota;
- preferências de acessibilidade;
- quatro perfis gráficos;
- oito laboratórios;
- seis critérios de validação;
- persistência e exportações verificadas estruturalmente;
- regressão completa das fases anteriores.

## Privacidade

Os dados são locais. Não há telemetria, cadastro, servidor ou envio automático.

## Limitações

- os checkpoints automáticos identificam ações significativas da interface, mas não substituem a avaliação conceitual do professor;
- o tempo ativo é aproximado e pausa após inatividade ou guia oculta;
- `speechSynthesis` varia conforme o navegador;
- temperatura, bateria e conforto físico exigem aparelhos reais;
- não foram recebidos relatórios reais suficientes para aplicar correções específicas por modelo de dispositivo;
- a captura automatizada WebGL continua condicionada ao subsistema gráfico do ambiente.

## Resultado

Aprovado quanto à implementação, ciência preservada, estrutura, acessibilidade local, persistência e distribuição. A validação física por aparelho e as correções específicas baseadas em relatórios reais permanecem como trabalho externo e mensurável.

## Resultados finais da distribuição

- `npm test`: aprovado;
- validação de sintaxe JavaScript: aprovada;
- auditoria estática: aproximadamente 652 KiB de JavaScript, 121 KiB de CSS e 808 KiB de GLB;
- arquivos JSON e webmanifest: 20 válidos;
- referências do cache offline: 107;
- referências ausentes: 0;
- arquivos de projeto antes do empacotamento: 218;
- HTTP 200 confirmado para `index.html`, aplicação, módulos pedagógicos, CSS, padrão pedagógico e service worker.

## Tentativa de navegador

Foi executado Chromium headless com servidor HTTP local, `--no-sandbox`, GPU desativada e orçamento de tempo virtual. O processo encerrou por timeout e não produziu DOM ou captura confiável. O log registrou indisponibilidade de DBus e do subsistema gráfico do ambiente. Esse resultado não é usado como aprovação visual.
