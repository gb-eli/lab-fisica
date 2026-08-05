# SISTEMA UNIVERSAL DE INTERAÇÃO

## Física Imersiva 360 — Fase Visual 5 — versão 0.2.7

## 1. Objetivo

Criar um contrato único para manipulação de objetos tridimensionais em todos os laboratórios. A bancada elétrica é a implementação de referência e deverá orientar Mecânica, Magnetismo, Ondas, Energia e os módulos futuros.

## 2. Módulos

- `js/interaction/interaction-manager.js`: raycasting, seleção, arraste, rotação, teclado, toque prolongado e bloqueio da câmera;
- `js/interaction/transform-gizmo.js`: setas X, Y e Z, centro de movimento livre e anel de rotação;
- `js/interaction/snap-system.js`: zonas de encaixe, distância limite e quantização angular;
- `js/interaction/connection-manager.js`: terminais, cabos, conexões, remoção e validação de caminho;
- `js/interaction/command-history.js`: comandos, desfazer, refazer e snapshots de transformação;
- `js/render/cables.js`: cabos dinâmicos que acompanham equipamentos movidos.

## 3. Modos

### Selecionar

- toque ou clique seleciona o equipamento;
- o contorno e o gizmo acompanham o objeto;
- o painel lateral mostra descrição e função.

### Mover

- arraste livre sobre a bancada;
- setas permitem deslocamento por X, Y ou Z;
- limites impedem que os componentes saiam da área de trabalho;
- a câmera orbital é bloqueada durante o arraste.

### Girar

- arraste o objeto ou o anel amarelo;
- com encaixe ativo, a rotação termina em passos de 15 graus.

### Conectar

- terminais aparecem como pontos luminosos;
- o primeiro toque seleciona a origem;
- o segundo cria ou remove o cabo;
- terminais ocupados são protegidos;
- cabos acompanham o movimento dos equipamentos;
- o modelo científico só energiza quando existe caminho válido.

## 4. Encaixe magnético

A bancada registra posições de referência e posições auxiliares. Quando um equipamento compatível entra na distância limite, sua posição e orientação são corrigidas. O encaixe pode ser desativado.

## 5. Histórico

As transformações e conexões usam comandos reversíveis. Estão disponíveis:

- desfazer;
- refazer;
- `Ctrl/Cmd + Z`;
- `Ctrl/Cmd + Shift + Z`;
- `Ctrl/Cmd + Y`;
- lista das últimas ações.

## 6. Atalhos

- `G`: mover;
- `R`: girar;
- `C`: conectar;
- `Esc`: cancelar ação e voltar à seleção;
- toque prolongado: inicia movimento em dispositivos móveis.

## 7. Persistência

A montagem pode ser salva localmente com:

- parâmetros elétricos;
- estado do interruptor;
- posição, rotação e escala dos componentes;
- conexões;
- estado do encaixe.

Nenhum dado pessoal é solicitado.

## 8. Modelo elétrico

A corrente só é calculada quando:

- o interruptor está fechado;
- existe caminho entre os terminais positivo e negativo;
- resistor, interruptor e carga estão conectados no grafo do circuito.

O fluxo de partículas nos cabos representa o estado calculado, não um efeito decorativo independente.

## 9. Acessibilidade e mobile

- modos também são acessíveis por botões DOM;
- mensagens informam seleção, encaixe, erro e conexão;
- o toolbar possui rolagem horizontal em telas pequenas;
- toque prolongado reduz a dependência de precisão;
- a câmera é liberada após a manipulação;
- o laboratório mantém fallback 2D.

## 10. Limitações

- não há física de cabo com gravidade e colisão;
- não existe detecção de colisão entre equipamentos;
- a rotação completa em três eixos ainda não foi liberada para evitar montagens incoerentes;
- os conectores ainda são marcadores científicos, não plugs mecânicos detalhados;
- o sistema foi aplicado integralmente apenas na bancada elétrica;
- validação visual em aparelhos reais permanece necessária.

## 11. Critérios de conclusão

- seleção por raycasting;
- contorno e gizmo;
- movimento livre e por eixos;
- rotação;
- encaixe magnético;
- terminais e cabos dinâmicos;
- caminho elétrico validado;
- câmera bloqueada durante manipulação;
- toque prolongado;
- desfazer e refazer;
- persistência local;
- testes automatizados.
