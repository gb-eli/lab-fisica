# Fase R6 — Piloto WebGL e correções por evidência

## Objetivo

Validar o pipeline gráfico antes de atribuir falhas a uma cena específica. A fase testa o navegador em camadas: contexto WebGL, shaders, desenho, leitura de pixel, redimensionamento, perda/restauração e primeiro quadro do runtime.

## Implementado

- pré-teste independente do Three.js em `js/render/webgl-preflight.js`;
- classificação `minimal`, `balanced` ou `advanced`;
- detecção de renderização por software;
- limites de textura, renderbuffer, viewport, atributos e unidades de textura;
- compilação e linkagem de shaders GLSL;
- desenho real e confirmação por `readPixels`;
- teste isolado da extensão `WEBGL_lose_context`;
- watchdog de sete segundos para o primeiro quadro;
- fallback 2D automático quando a cena não desenha;
- eventos `fisica:webgl-preflight`, `fisica:render-ready` e `fisica:render-fallback`;
- modo 3D seguro nas configurações;
- painel para testar WebGL e recuperação;
- relatório local exportável junto ao diagnóstico transversal.

## Piloto automatizado

O script `tools/webgl_pilot_test.py` executa Chromium em Xvfb com SwiftShader. Foram testados desktop 1365×768 e mobile 390×844. Nos dois perfis:

- WebGL 2 foi criado;
- shaders compilaram e foram ligados;
- um triângulo foi desenhado;
- o pixel central retornou RGBA válido;
- o canvas foi redimensionado;
- o contexto foi perdido e restaurado;
- não houve erro de console.

## Limites

O teste usa renderização por software e não mede a GPU física. O pacote completo local do Three.js ainda não foi incorporado porque as fontes externas não puderam ser baixadas pelo ambiente de construção. O loader continua local-first, seguido de duas fontes fixas, e o fallback 2D permanece obrigatório.
