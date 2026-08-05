# NÚCLEO DE RENDERIZAÇÃO PREMIUM

**Fase Visual 2 — versão 0.2.4**

## Objetivo

Centralizar a infraestrutura gráfica da Física Imersiva 360 para que Hall, Física Avançada e todos os laboratórios futuros utilizem o mesmo ciclo de vida, câmeras, iluminação, materiais, desempenho e recuperação de falhas.

## Módulos implementados

- `js/render/runtime.js`: cena, câmera, renderer, resize, loop, qualidade e ciclo de vida;
- `js/render/three-loader.js`: tentativa de módulo local e fallback fixado no Three.js 0.184.0;
- `js/render/orbit-controller.js`: órbita, toque, pinça, zoom, limites e restauração;
- `js/render/environment.js`: environment map procedural processado por PMREM;
- `js/render/materials.js`: biblioteca PBR para metal, vidro, cerâmica, polímero e emissivos;
- `js/render/postfx.js`: pós-processamento leve com realce de altas luzes, vinheta e aberração cromática discreta;
- `js/render/performance-monitor.js`: FPS, draw calls, triângulos, linhas, pontos, geometrias e texturas;
- `js/render/dispose.js`: descarte de geometrias, materiais e texturas.

## Recursos funcionais

### Renderer compartilhado

Hall e Física Avançada não criam mais `WebGLRenderer` diretamente. Ambos solicitam uma instância ao núcleo compartilhado.

### Iluminação e materiais

O núcleo aplica:

- saída sRGB;
- tone mapping ACES Filmic;
- exposição configurável por ambiente;
- sombras por perfil;
- environment map procedural;
- materiais fisicamente baseados reutilizáveis.

### Pós-processamento

Nos perfis compatíveis, o pipeline renderiza para um `WebGLRenderTarget` e aplica um passe final leve. O usuário pode desativá-lo.

O efeito não altera resultados científicos. Ele atua somente na apresentação visual.

### Resolução dinâmica

O monitor calcula uma média móvel de FPS. Quando habilitado, reduz ou recupera gradualmente a escala interna de renderização sem modificar:

- fórmulas;
- estado científico;
- posições calculadas;
- medições;
- gráficos.

### Diagnóstico

A opção “Mostrar métricas de desempenho” exibe:

- FPS;
- draw calls;
- triângulos;
- texturas;
- escala dinâmica.

### Contexto WebGL

O canvas trata:

- `webglcontextlost`;
- pausa visual durante a perda;
- aviso acessível;
- `webglcontextrestored`;
- resize e retomada.

### Ciclo de vida

Ao trocar de módulo, o núcleo remove:

- loop de animação;
- observadores;
- eventos;
- render targets;
- environment maps;
- geometrias;
- materiais;
- texturas;
- contexto do renderer.

## Dependência Three.js

O carregador procura primeiro:

`vendor/three/three.module.min.js`

A distribuição local completa não pôde ser incorporada nesta execução. Quando o arquivo local não existe, o núcleo utiliza a versão fixa 0.184.0 pelo jsDelivr.

Consequência atual:

- interface, cálculos, PWA e módulos 2D continuam locais;
- a primeira abertura das cenas Three.js ainda exige rede;
- fallback 2D permanece disponível;
- empacotamento integral do Three.js continua como item técnico pendente.

## Limites desta fase

Esta fase melhora a infraestrutura, consistência e estabilidade. Ela não substitui a próxima fase de produção de conteúdo visual.

Ainda faltam:

- modelos GLB profissionais;
- texturas PBR definitivas;
- HDRI autoral ou licenciado;
- loaders GLTF, KTX2 e Meshopt;
- LODs de ambiente e equipamentos;
- colisores;
- objetos realistas da bancada elétrica;
- playtest visual em aparelhos reais.

## Critério de conclusão

- [x] Hall migrado para núcleo compartilhado;
- [x] Física Avançada migrada;
- [x] controle orbital compartilhado;
- [x] environment map procedural;
- [x] biblioteca PBR;
- [x] pós-processamento opcional;
- [x] resolução dinâmica;
- [x] métricas de desempenho;
- [x] recuperação de contexto;
- [x] descarte de recursos;
- [x] testes de contratos;
- [~] Three.js local completo;
- [ ] validação visual em matriz real de dispositivos.
