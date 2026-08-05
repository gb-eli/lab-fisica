# Termologia, Gases e Fluidos Premium 360

## Versão

Implementação inicial funcional: **v0.3.4**.

## Objetivo

Criar um laboratório tridimensional integrado para investigar temperatura, calor, mudanças de estado, gases, hidrostática, dinâmica dos fluidos e máquinas térmicas. Os cálculos científicos permanecem independentes da renderização, das partículas e do FPS.

## Experiências

### Calorimetria e equilíbrio térmico

Dois recipientes transparentes, líquidos com resposta visual à temperatura, termômetros, partículas microscópicas e fluxo energético. O motor resolve o equilíbrio pela conservação de energia e apresenta as trocas de calor de cada corpo.

### Condução, convecção e radiação

Blocos quente e frio, placa intercambiável, partículas de condução, correntes convectivas e fótons térmicos. Os três mecanismos são calculados separadamente e somados somente na leitura total.

### Mudanças de estado e gases

Água representada por frações sólida, líquida e de vapor, com patamares de fusão e ebulição. Um cilindro transparente contém partículas de gás e pistão móvel para processos isotérmico, isobárico, isocórico e adiabático.

### Hidrostática e empuxo

Tanque transparente com faixas de pressão, sonda de profundidade, manômetro, corpo submerso e vetores de peso e empuxo. O estado previsto pode ser subida, descida ou equilíbrio neutro.

### Continuidade, Bernoulli e viscosidade

Tubo Venturi transparente, partículas com velocidade adaptada à seção, manômetros e jato de saída. O laboratório calcula vazão, velocidade, pressão, Reynolds e estimativa laminar de Poiseuille.

### Máquina térmica e refrigeração

Reservatórios quente e frio, cilindro, pistão, volante, compressor e partículas de transferência energética. O estudante compara eficiência ou COP real ao limite reversível de Carnot.

## Motor científico

Arquivo: `js/science/thermodynamics-fluids.js`.

Inclui:

- conversões de temperatura;
- calor sensível;
- equilíbrio calorimétrico;
- calor latente;
- dilatação linear;
- condução;
- convecção;
- radiação térmica;
- mudança de fase da água;
- gás ideal;
- processos gasosos;
- pressão hidrostática;
- empuxo;
- continuidade;
- Bernoulli;
- Torricelli;
- Reynolds;
- Poiseuille;
- motor térmico;
- refrigerador.

## Recursos visuais

- ambiente técnico fechado;
- materiais PBR;
- câmera orbital 360°;
- zoom por mouse e pinça;
- câmera automática;
- câmera lenta;
- temperatura ligada à cor e emissão;
- partículas de moléculas, calor e fluido;
- instrumentos tridimensionais;
- gráficos científicos;
- perfis gráficos adaptativos;
- fallback 2D.

## Limitações do modelo

- a transferência térmica é concentrada em modelos agrupados ou unidimensionais;
- não há CFD completo;
- a água utiliza valores médios de calor específico e calor latente;
- o gás é ideal;
- Bernoulli pressupõe escoamento incompressível e estacionário;
- Poiseuille vale para escoamento laminar em tubo circular;
- as máquinas térmicas são modelos energéticos educacionais;
- equipamentos são modelos procedurais detalhados e poderão ser substituídos por GLBs Blender futuros.

## Persistência e evidência

Parâmetros, modo, leituras e conclusão podem ser salvos localmente e exportados em JSON.
