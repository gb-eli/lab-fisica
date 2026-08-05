# RELATÓRIO DE VALIDAÇÃO — v0.2.6

## Escopo

Fase Visual 4 — Hall Científico 360 Premium.

## Validações aprovadas

### JavaScript

- validação de sintaxe em todos os módulos;
- contratos do Hall Premium;
- sete setores registrados;
- ausência de Química;
- arquitetura, mapa, áudio e navegação presentes;
- controle orbital com `setPose` e `setEnabled`;
- prévias científicas para os sete setores;
- limite de luzes dinâmicas por perfil.

### Ciência

- testes de eletrostática preservados;
- contratos científicos da Física Avançada preservados;
- representações avançadas continuam marcadas como conceituais;
- renderização continua separada do estado científico.

### Assets

- pipeline GLB preservado;
- 18 arquivos GLB válidos;
- pacote elétrico disponível para prévia no Hall;
- texturas e colisores preservados.

### Publicação estática

- novos módulos incluídos no cache PWA;
- nova folha de estilos incluída no HTML e cache;
- manifesto atualizado;
- rotas preservadas;
- servidor HTTP local respondeu aos arquivos estáticos.

### Acessibilidade estrutural

- mapa textual;
- controles com atributos ARIA;
- fallback 2D;
- navegação por teclado nos controles DOM;
- alto contraste, redução de movimento e transparência preservados.

## Verificação visual automatizada

A tentativa de abrir a aplicação com Chromium/Playwright não foi concluída. O navegador do ambiente bloqueou a navegação local com `ERR_BLOCKED_BY_ADMINISTRATOR`, inclusive por `localhost`, domínio mapeado e protocolo `file`.

Por esse motivo, este relatório não afirma que houve validação visual automatizada completa.

## Validação ainda necessária em aparelhos reais

- Chrome Android;
- Safari iPhone;
- Chromebook;
- notebook com GPU integrada;
- computador com perfil Alto ou Ultra;
- toque, pinça e orientação paisagem;
- tela cheia;
- áudio;
- mapa;
- passeio guiado;
- entrada nos portais;
- estabilidade após alternar rotas repetidamente.

## Resultado

A estrutura, os contratos, a sintaxe, os testes científicos e a publicação estática estão aprovados. A inspeção visual e o playtest em aparelhos reais permanecem pendentes.
