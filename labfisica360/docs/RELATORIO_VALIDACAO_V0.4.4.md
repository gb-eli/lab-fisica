# Relatório de Validação — Física Imersiva 360 v0.4.4

## Resultado geral

A versão foi aprovada nos seguintes limites:

- motores científicos e regressão estrutural;
- sintaxe JavaScript;
- integridade dos dados e do cache offline;
- publicação HTTP estática;
- smoke test em Chromium no modo seguro 2D;
- navegação desktop e mobile;
- troca de visualizações, cenários, reinícios visíveis e limpeza rápida de rotas.

A aprovação **não** inclui WebGL em GPU real, qualidade final de sombras, materiais, gestos físicos, temperatura ou bateria.

## Defeitos reproduzidos e corrigidos

1. `disposed` inexistente em Mecânica, Ondas e Termofluidos durante cleanup assíncrono.
2. Botão **Apoio** visualmente presente, mas com a área de clique invadida pela coluna de estado.
3. HUD pedagógico flutuante cobrindo títulos, ações e parte das cenas.
4. Catálogo com cartões estreitos, ações cortadas e rolagem horizontal desnecessária.
5. Exceção em `afterNavigate` capaz de manter `aria-busy` e prejudicar a navegação seguinte.
6. Falta de sinais determinísticos de aplicação e rota prontas para diagnóstico e teste.
7. Nova rota abrindo na posição de rolagem da tela anterior.
8. Rótulos decorativos do Hall 2D competindo com a orientação principal.

## Smoke test de navegador

Ferramenta: `tools/browser_smoke_test.py`  
Relatório: `validation/r5-browser-smoke.json`

O teste carrega HTML, CSS e módulos locais em memória no Chromium e força o fallback 2D. Isso contorna a política do ambiente que bloqueia navegação para localhost sem representar falsamente uma validação WebGL.

### Perfis

| Perfil | Viewport | Rotas | Trocas de view | Cenários alterados | Reinícios clicados | Erros | Overflow |
|---|---:|---:|---:|---:|---:|---:|---:|
| Desktop | 1365×768 | 10/10 | 40 | 7 | 7 | 0 | 0 |
| Mobile | 390×844 | 10/10 | 40 | 7 | 6 | 0 | 0 |

Totais:

- 20 combinações rota × perfil;
- 80 trocas entre Laboratório, Cena, Controles, Resultados e Apoio;
- 14 mudanças de cenário;
- 13 reinícios acionados por controles visíveis;
- 0 erros de página;
- 0 erros ou avisos de console registrados;
- 0 erros de rota;
- 0 overflow horizontal visível fora de contêineres próprios de rolagem;
- Configurações abertas nos dois perfis;
- troca rápida Mecânica → Ondas → Termofluidos → Hall → Eletricidade → Laboratórios aprovada.

## Regressão automatizada

`npm test` aprovado, incluindo:

- todos os motores científicos;
- Hall e laboratórios premium;
- assets e 36 GLBs;
- interação universal;
- acessibilidade e pedagogia;
- recuperação estrutural;
- reconstruções R2, R3 e R4;
- integridade estática;
- contratos específicos da R5.

## Auditoria técnica final

- JavaScript: aproximadamente 756 KiB;
- CSS: aproximadamente 166 KiB;
- GLB: aproximadamente 808 KiB;
- GLBs elétricos: 36;
- arquivos JSON e webmanifest válidos: 26;
- referências principais do service worker: 121;
- referências offline ausentes: 0;
- arquivos principais testados por HTTP: resposta 200;
- arquivos do projeto antes do ZIP: 268, incluindo oito capturas do smoke test.

## Evidências

- `validation/r5-browser-smoke.json`;
- `validation/screenshots/desktop-hall.png`;
- `validation/screenshots/desktop-coulomb.png`;
- `validation/screenshots/desktop-ohm.png`;
- `validation/screenshots/desktop-roadmap.png`;
- versões mobile equivalentes;
- `assets/r5-playtest.json`;
- `tools/browser_smoke_test.py`.

## Pendências honestas

Ainda exigem aparelhos reais:

- WebGL 1 e WebGL 2 em GPUs variadas;
- perfis Econômico, Médio, Alto e Ultra;
- sombras, iluminação, transparência e materiais PBR;
- toque, pinça, arraste e precisão dos terminais;
- escala percebida dos objetos e bancadas;
- estabilidade durante 30 minutos ou mais;
- uso de memória, aquecimento e bateria;
- Chromebook e computadores escolares;
- perda e recuperação real de contexto WebGL;
- primeiro carregamento 3D sem internet enquanto o Three.js completo não estiver incorporado localmente.
