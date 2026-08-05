# Three.js local

A plataforma está fixada na revisão r184 e espera estes arquivos:

- `three.module.min.js`
- `three.core.min.js`

Execute `npm run vendor:three` em um ambiente com acesso à internet. Depois execute `npm run check:three`.

A R7B somente pode ser aprovada quando `vendor-manifest.json` indicar `ready: true` e as cenas completas iniciarem com a opção de carregamento remoto desativada.
