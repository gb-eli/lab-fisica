# Relatório de Validação — v0.4.1

**Data:** 04/08/2026  
**Fase:** R2 — reconstrução de Hall, Eletrostática e Eletricidade

## Escopo validado

- navegação orientada do Hall;
- nova cena 3D/360° de Eletrostática;
- fallback Canvas 2D e troca de visualização;
- presets de atração, repulsão e configuração assimétrica;
- arraste de cargas e sonda;
- força, campo e potencial sincronizados;
- montagem guiada da bancada elétrica;
- presets de tensão e início seguro;
- preservação de solver, instrumentos, fusíveis, cabos e ferramentas avançadas;
- responsividade estrutural;
- cache, publicação estática e integridade do pacote.

## Resultados automáticos

- suíte completa `npm test`: aprovada;
- todos os motores científicos anteriores: aprovados;
- teste específico `r2-core-labs.test.mjs`: aprovado;
- sintaxe de todos os arquivos JavaScript e MJS: aprovada;
- arquivos JSON e webmanifest válidos: 22;
- referências do cache offline: 114;
- referências offline ausentes: 0;
- arquivos GLB preservados: 36;
- tamanho total aproximado do JavaScript: 727.995 bytes;
- tamanho total aproximado do CSS: 160.390 bytes;
- tamanho total dos GLBs: 827.160 bytes;
- maior módulo JavaScript: `js/modules/ohm.js`, 66.530 bytes;
- arquivos principais testados por HTTP: respostas 200.

## Testes HTTP realizados

- `/`;
- `/index.html`;
- `/css/r2-core-labs.css`;
- `/js/modules/coulomb3d.js`;
- `/js/modules/ohm.js`;
- `/assets/models/electrical/workbench_lod2.glb`.

## Recuperação e compatibilidade

- falha de criação da cena 3D preserva o conteúdo 2D;
- troca de rota desmonta o runtime compartilhado;
- carregamentos tardios são descartados;
- o loader tenta arquivo local e fontes externas configuradas;
- o pacote local completo do Three.js ainda não está incorporado;
- o service worker não substitui JavaScript ou CSS ausente por HTML.

## Limitação da validação visual

O Chromium headless disponível encerrou por timeout, sem DOM ou captura, acompanhado de falhas de DBus e do subsistema gráfico. Portanto, não foram declarados como aprovados:

- composição visual final;
- sombras e iluminação;
- escala percebida dos equipamentos;
- conforto de rotação e pinça;
- leitura em telas pequenas;
- aquecimento, bateria e estabilidade prolongada.

## Resultado

A versão é considerada **aprovada científica, estrutural, estática e funcionalmente por contrato**. A aprovação visual e tátil final permanece condicionada ao playtest em celular, tablet, Chromebook e computador real.
