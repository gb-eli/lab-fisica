# Energia, Casa Elétrica e Rede Premium 360

## Versão

Implementação funcional na versão **0.3.1**, correspondente à Fase Visual 8B.

## Objetivo

Integrar consumo residencial, proteção elétrica, geração distribuída, armazenamento e rede de distribuição em um laboratório 3D/360° com cálculos independentes da renderização.

## Experiências

### Casa elétrica

- residência em corte com sala, cozinha, quarto, banheiro e lavanderia;
- iluminação, geladeira, micro-ondas, computador, lavadora, ar-condicionado e chuveiro;
- circuitos separados por finalidade;
- corrente, potência ativa, potência aparente e fator de potência;
- consumo diário e mensal;
- tarifa configurável;
- cabos, quadro e partículas de fluxo;
- aquecimento de condutores e atuação de proteção.

### Quadro e proteções

- disjuntor geral;
- dispositivo DR de 30 mA;
- disjuntores de iluminação, tomadas, cozinha, climatização e chuveiro;
- barramento e medidor bidirecional;
- estados normal, alerta, sobrecarga, abertura por aquecimento e disparo por fuga;
- alavancas e cores vinculadas aos resultados do motor científico.

### Microgeração

- módulos solares detalhados;
- potência instalada, irradiância, temperatura e sombreamento;
- redução térmica da geração fotovoltaica;
- turbina eólica com rotação dependente do vento;
- potência disponível proporcional ao cubo da velocidade antes do limite nominal;
- inversor;
- bateria com carga, descarga, eficiência, limite de potência e estado de carga;
- importação e exportação de energia pela rede;
- partículas com sentido coerente ao fluxo.

### Rede de distribuição

- transformador de distribuição;
- postes, cruzetas e isoladores;
- três condutores aéreos;
- casas conectadas;
- demanda comunitária e geração distribuída;
- resistência e comprimento da linha;
- queda de tensão;
- perdas por efeito Joule;
- perdas do transformador;
- fluxo reverso quando a geração supera a demanda.

## Motor científico

Arquivo: `js/science/energy-grid.js`.

Responsabilidades:

- cálculo individual de cargas;
- agrupamento por circuitos;
- corrente dos ramos;
- aquecimento e perdas nos cabos;
- proteção por disjuntor e DR;
- geração solar;
- geração eólica;
- despacho da bateria;
- balanço entre carga, renováveis, bateria e rede;
- consumo em kWh e custo;
- queda de tensão e perdas da distribuição.

A renderização lê os resultados do motor. O FPS não altera correntes, energia, consumo, proteção ou perdas.

## Interface e acessibilidade

- rota `#energy`;
- acesso pelo dock e pelo portal Energia do Hall;
- câmera orbital, zoom e câmera automática;
- tela cheia;
- interface responsiva;
- controles grandes em dispositivos móveis;
- fallback 2D quando WebGL não estiver disponível;
- salvamento local;
- exportação de evidência em JSON;
- nenhuma coleta de dados pessoais.

## Limitações honestas

- a casa e a rede são modelos procedurais detalhados, não assets Blender finais;
- o disparo térmico é uma aproximação didática, não uma curva normativa completa de disjuntores;
- o DR utiliza corrente de fuga agregada;
- não há simulação transitória eletromagnética da rede;
- geração solar e eólica usa modelos educacionais reduzidos;
- bateria não modela química, degradação ou temperatura interna detalhada;
- a cidade completa com usinas hidrelétrica, térmica e subestação de alta tensão permanece para expansão futura;
- a validação visual final em aparelhos reais continua obrigatória.
