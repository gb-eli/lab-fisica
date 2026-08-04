# Reconstrução R2 — Hall, Eletrostática e Eletricidade

**Versão:** 0.4.1  
**Escopo:** reconstrução visual, funcional e pedagógica dos três ambientes prioritários.

## Objetivo da fase

Fazer com que o aluno identifique rapidamente onde está, o que deve fazer, qual controle deve alterar e qual resultado deve observar. Nenhum novo conteúdo foi adicionado.

## Hall Científico

### Problemas tratados

- excesso de acessos com a mesma prioridade;
- muitos rótulos simultâneos sobre a cena 3D;
- ausência de uma sequência recomendada;
- confusão entre explorar o Hall e iniciar uma atividade.

### Nova organização

- trilha Fundamentos para Circuitos: Eletrostática → Eletricidade → Eletromagnetismo;
- uma ação principal: começar pela Eletrostática;
- catálogo completo como ação secundária;
- lista compacta 2D dentro de um painel recolhido;
- rótulos 3D ocultos no modo guiado até o aluno selecionar um setor;
- objetivo de navegação em três etapas.

## Eletrostática 360°

### Cena reconstruída

- cena Three.js com plataforma, malha, iluminação e materiais físicos;
- cargas esféricas com sinal e cor coerentes;
- sonda tridimensional;
- vetores de força;
- grade de vetores de campo;
- mapa de potencial no plano;
- câmera orbital, zoom e controles assistidos;
- arraste das duas cargas e da sonda diretamente no plano 3D;
- fallback 2D preservado;
- alternância 3D/2D sem perder o estado.

### Fluxo pedagógico

1. escolher Atração, Repulsão ou Assimétrico;
2. alterar uma carga ou a distância;
3. comparar interação, força, campo e potencial.

Controles de massa e velocidade ficaram recolhidos porque não são essenciais para a primeira investigação.

## Eletricidade e Circuitos 360°

### Problemas tratados

- topologias, manipulação, instrumentos, falhas e exportação apareciam com peso semelhante;
- o aluno podia energizar antes de entender a montagem;
- cabos e instrumentos exigiam conhecimento prévio para começar;
- estado da atividade não ficava claro sobre a cena.

### Nova montagem guiada

- escolha visual de série, paralelo ou misto;
- presets seguros de 6 V, 12 V e 18 V;
- botão de montagem segura;
- configuração automática dos cabos e do multímetro;
- proteção e limites restaurados antes da energização;
- sobreposição compacta com atividade, instrução e passo atual;
- ferramentas de mover, girar, conectar, histórico e fusíveis mantidas no modo Explorar/Apoio;
- pergunta central e resultado esperado visíveis.

## Mobile

- cena primeiro;
- cabeçalho e pergunta central compactados;
- presets empilhados em telas pequenas;
- readouts reduzidos ao essencial;
- painel de atividade elétrica deixa de cobrir a cena;
- toolbar de Eletrostática pode rolar horizontalmente;
- alternativa 2D disponível sem sair do laboratório.

## Limitações honestas

- a cena de Eletrostática representa as cargas em um plano tridimensional; não é um solver volumétrico contínuo;
- os vetores de campo utilizam uma amostragem discreta;
- a bancada elétrica ainda não utiliza física rígida para impedir toda sobreposição;
- o Three.js ainda pode depender de CDN no primeiro carregamento;
- a validação visual final em aparelhos reais continua necessária.
