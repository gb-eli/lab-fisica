# Relatório de Validação — v0.4.2

## Escopo

Reconstrução R3 dos laboratórios de Eletromagnetismo, Energia e Mecânica.

## Entregas validadas

- 10 cenários guiados de Eletromagnetismo;
- 8 cenários guiados de Energia;
- 10 cenários guiados de Mecânica;
- pergunta investigativa e três etapas em cada cenário;
- aplicação direta dos presets nos controles científicos existentes;
- rótulos das leituras alterados conforme o fenômeno;
- pausa e reinício do tempo em Eletromagnetismo e Energia;
- reinício dos cenários de Mecânica;
- correção das leituras do modo Rede de distribuição;
- interface responsiva da orientação guiada;
- recursos avançados e motores científicos preservados.

## Testes

- suíte completa `npm test`: aprovada;
- sintaxe de todos os módulos JavaScript: aprovada;
- 23 arquivos JSON/webmanifest: válidos;
- 119 referências do cache offline: encontradas;
- arquivos ausentes no cache: 0;
- arquivos principais testados por HTTP: respostas 200;
- 36 arquivos GLB: preservados;
- auditoria estática de desempenho: dentro do orçamento.

## Orçamento estático

- JavaScript: 750.831 bytes, aproximadamente 733 KiB;
- CSS: 163.800 bytes, aproximadamente 160 KiB;
- GLB: 827.160 bytes, aproximadamente 808 KiB;
- maior módulo JavaScript: 66.530 bytes;
- todos os limites configurados foram respeitados.

## Validação de navegador

Foi tentada a abertura da rota `#magnetism` com Chromium headless. O processo encerrou por timeout e não produziu DOM, apresentando falhas de DBus e do subsistema gráfico. Consequentemente, não são declarados como aprovados nesta etapa:

- escala percebida dos objetos;
- sombras e iluminação;
- conforto da câmera e da pinça;
- sobreposição de painéis;
- legibilidade em telas físicas;
- temperatura, bateria e estabilidade prolongada.

## Conclusão

A versão 0.4.2 está aprovada científica, estrutural, estática e offline. A inspeção visual e tátil continua pendente em aparelhos reais.
