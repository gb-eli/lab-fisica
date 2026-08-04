# Three.js local — pendência controlada

O runtime procura primeiro:

- `vendor/three/three.module.min.js`
- `vendor/three/three.core.min.js`

A versão esperada é a 0.184.0/r184. Esses dois arquivos não foram incluídos na v0.4.5 porque o ambiente de construção bloqueou a transferência completa dos arquivos externos. O loader então tenta as fontes fixas jsDelivr e unpkg.

Sem internet, os cálculos, gráficos, rotas e fallbacks 2D continuam disponíveis; as cenas Three.js exigem a inclusão desses dois arquivos para o primeiro carregamento totalmente offline.

Não substitua por versões diferentes sem repetir a suíte R6.
