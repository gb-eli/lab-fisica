# Relatório de Validação — v0.4.3

## Escopo

Reconstrução R4 dos laboratórios de Ondas, Termofluidos e Física Avançada.

## Resultado funcional

- 13 cenários guiados em Ondas;
- 12 cenários guiados em Termofluidos;
- 10 cenários guiados em Física Avançada;
- validade e limite do modelo apresentados em cada cenário;
- reinício adicionado a Ondas;
- pausa e reinício adicionados à Física Avançada;
- rótulos das leituras de Termofluidos contextualizados;
- gráficos com área visual reforçada;
- interface mobile compactada;
- todos os motores científicos anteriores preservados.

## Testes automatizados

- suíte completa `npm test`: aprovada;
- teste específico R4: aprovado;
- sintaxe de todos os módulos JavaScript: aprovada;
- arquivos JSON e webmanifest: 24 válidos;
- cache offline: 120 referências, nenhuma ausente;
- arquivos principais e arquivos R4 pelo servidor HTTP: respostas 200;
- 36 modelos GLB elétricos preservados.

## Auditoria estática

- JavaScript: aproximadamente 756 KiB;
- CSS: aproximadamente 164 KiB;
- GLB: aproximadamente 808 KiB;
- botões declarados nos templates: 115;
- campos de entrada: 154;
- seletores: 20;
- cartões/painéis: 47.

As contagens de template não significam que todos os elementos estejam visíveis ao mesmo tempo. O workspace mantém divulgação progressiva.

## Validação de navegador

Foi tentado Chromium headless com navegação local. O processo encerrou por timeout sem produzir DOM ou captura, registrando falhas de DBus e do subsistema gráfico.

Portanto, continuam pendentes em aparelhos reais:

- sombras e iluminação;
- proporção visual dos objetos;
- gestos de toque e pinça;
- sobreposição em diferentes telas;
- legibilidade dos gráficos;
- estabilidade prolongada;
- temperatura e bateria.

## Conclusão

A versão 0.4.3 está aprovada científica, estrutural, estática, HTTP e offline. A aprovação visual e tátil depende de playtest em hardware real.
