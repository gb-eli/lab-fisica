# Relatório de Validação — v0.4.5

## Escopo

Fase R6: pré-teste WebGL, primeiro quadro, fallback, diagnóstico e piloto automatizado por software.

## Resultados

- WebGL 2 criado em desktop e mobile virtuais;
- shaders e desenho aprovados;
- leitura do pixel central aprovada;
- redimensionamento aprovado;
- perda e restauração do contexto aprovadas;
- captura visual do triângulo gerada nos dois perfis;
- modo 3D seguro integrado;
- watchdog do primeiro frame integrado;
- regressão científica e estrutural executada;
- cache offline e integridade do ZIP verificados na consolidação.

## Não validado

- GPU física;
- cenas Three.js completas sem internet;
- FPS e memória em aparelhos escolares;
- toque e pinça reais;
- estabilidade prolongada;
- aquecimento e bateria.

## Métricas finais

- JavaScript: 789.642 bytes (aprox. 771 KiB);
- CSS: 170.588 bytes (aprox. 167 KiB);
- GLB: 827.160 bytes (aprox. 808 KiB);
- desktop SwiftShader: WebGL 2, pixel 128/128/255/255 e recuperação aprovada;
- mobile SwiftShader: WebGL 2, pixel 128/128/255/255 e recuperação aprovada;
- 36 GLBs preservados;
- todos os testes automatizados aprovados.

## Limitação do Three.js local

O loader continua procurando primeiro `vendor/three/three.module.min.js`, mas o arquivo completo e seu `three.core.min.js` não puderam ser incorporados neste ambiente. A aplicação ainda precisa de uma das fontes externas no primeiro carregamento 3D. O modo 2D e o diagnóstico WebGL são totalmente locais.

## Consolidação da publicação

- 28 arquivos JSON/webmanifest válidos;
- 123 referências do cache offline verificadas e nenhuma ausente;
- arquivos principais responderam HTTP 200;
- 278 arquivos incluídos antes do empacotamento;
- suíte completa aprovada após a correção final do limite de pixel ratio.
