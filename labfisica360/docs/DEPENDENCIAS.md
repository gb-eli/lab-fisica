# DEPENDÊNCIAS E LICENÇAS

## Three.js

- versão fixada: r184 / pacote 0.184.0;
- carregador central: `js/render/three-loader.js`;
- prioridade: `vendor/three/three.module.min.js`;
- fallback atual: módulo ES fixado pelo jsDelivr;
- licença: MIT;
- runtime: `js/render/runtime.js`;
- uso atual: Hall e Física Avançada;
- fallback visual: apresentações 2D quando o módulo não puder ser carregado.

A distribuição local completa ainda não foi incorporada. Os cálculos científicos permanecem independentes do Three.js.


## Design System Científico — v0.2.4

O design system não depende de bibliotecas externas. Ele utiliza:

- CSS nativo em `css/design-system.css`;
- temas de módulo em `js/design-system.js`;
- ícones SVG próprios em `js/ui/icons.js`;
- fontes de sistema para reduzir carregamento e preservar funcionamento offline.

Nenhuma fonte ou pacote de ícones remoto é necessário.


## Pipeline de assets — v0.2.5

- Trimesh: geração reprodutível dos GLBs próprios durante desenvolvimento;
- Pillow: geração das texturas procedurais locais;
- GLB 2.0: formato de distribuição dos equipamentos;
- loader GLB leve próprio: execução no navegador sem dependência adicional;
- nenhuma marca ou asset de terceiros foi incorporado ao pack elétrico inicial.


## Web Audio API

Utilizada sem dependência externa em `js/modules/hall-audio.js` para ambiência gerada localmente e posicionamento HRTF. O áudio somente inicia após interação explícita do usuário.


## Hall Científico 360 Premium

A arquitetura, prévias e mapa são procedurais. A sala de Circuitos reutiliza o pacote GLB elétrico. Não foram adicionados assets ou bibliotecas de terceiros nesta fase.
