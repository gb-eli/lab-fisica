# HALL CIENTÍFICO 360 PREMIUM
## Especificação e implementação — v0.2.6

## 1. Objetivo

Transformar a entrada da Física Imersiva 360 em um centro científico tridimensional coerente, navegável e reutilizável como ponto de acesso a todos os laboratórios.

O Hall não deve ser apenas um menu com objetos flutuantes. Ele deve comunicar:

- escala arquitetônica;
- organização dos setores;
- identidade científica;
- continuidade entre os laboratórios;
- qualidade gráfica adaptativa;
- acessibilidade;
- estado real de cada módulo.

## 2. Arquitetura implementada

A cena contém:

- átrio central fechado;
- piso técnico circular em escala ampliada;
- cúpula translúcida;
- estrutura externa segmentada;
- colunas estruturais;
- painéis de vidro;
- anel de iluminação superior;
- passarela elevada;
- guarda-corpos;
- corredores radiais;
- sete salas físicas;
- núcleo central com elevador animado;
- plataforma de energia;
- mapa holográfico tridimensional.

## 3. Setores físicos

1. Eletrostática;
2. Circuitos;
3. Energia;
4. Magnetismo;
5. Mecânica;
6. Ondas e Óptica;
7. Física Avançada.

Cada sala possui:

- corredor próprio;
- iluminação funcional;
- cor temática;
- portal integrado à arquitetura;
- painel de identificação;
- prévia tridimensional;
- estado ativo ou planejado;
- descrição acessível em DOM.

## 4. Prévias científicas

As prévias não substituem os laboratórios completos. Elas comunicam visualmente o conteúdo de cada setor.

### Eletrostática

- duas cargas;
- linhas de campo aproximadas;
- movimento e pulsação controlados.

### Circuitos

- circuito fechado representativo;
- fluxo de elétrons;
- bateria e instrumento;
- carregamento opcional dos assets GLB reais da bancada elétrica.

### Energia

- rotor e gerador transparente;
- partículas representando transferência de energia.

### Magnetismo

- ímã de barra;
- linhas de campo;
- solenoide.

### Mecânica

- pêndulo;
- rampa;
- carrinho em movimento.

### Ondas e Óptica

- frente de onda animada;
- lente transparente.

### Física Avançada

- horizonte escuro;
- disco de acreção conceitual;
- anel de lente;
- partículas orbitais.

## 5. Navegação

### Visão geral

- câmera orbital;
- rotação automática opcional;
- zoom por roda ou pinça;
- arraste por mouse ou toque.

### Passeio guiado

- transições suaves entre salas;
- setor anterior e próximo;
- foco em nível mais próximo do ambiente;
- painel contextual;
- retorno ao átrio.

### Teletransporte

- seleção pelo mapa holográfico;
- seleção pela lista lateral;
- seleção pela alternativa 2D;
- foco de câmera no setor.

### Portais

- um clique ou toque seleciona e aproxima;
- novo acionamento em portal ativo abre o laboratório;
- setores planejados conduzem ao roadmap.

## 6. Mapa

O Hall possui duas representações complementares:

### Mapa 3D

- anel holográfico no núcleo central;
- nós correspondentes aos setores;
- rotação controlada;
- cores funcionais.

### Mapa acessível em DOM

- lista completa de setores;
- descrição textual;
- navegação por teclado;
- alternativa utilizável sem WebGL;
- compatibilidade com leitores de tela.

## 7. Áudio

O áudio é gerado localmente pela Web Audio API e somente inicia após ação explícita do usuário.

Inclui:

- ambiência de baixa intensidade;
- ruído técnico filtrado;
- tom setorial posicionado com HRTF;
- atualização da posição do ouvinte pela câmera;
- desligamento imediato;
- respeito à configuração global de som.

Nenhum arquivo de áudio externo é necessário.

## 8. Partículas

As partículas foram separadas em:

- poeira e atmosfera ambiental;
- partículas setoriais;
- fluxo elétrico;
- transferência energética;
- linhas e trajetórias de fenômenos.

A quantidade varia conforme o perfil gráfico.

## 9. Desempenho

O Hall utiliza:

- perfis Econômico, Médio, Alto, Ultra e Científico;
- resolução dinâmica;
- pós-processamento opcional;
- sombras adaptativas;
- limite de luzes dinâmicas simultâneas;
- redução de detalhe arquitetônico;
- LOD econômico para os assets da bancada;
- fallback 2D;
- descarte do runtime ao sair da rota.

## 10. Mobile

Em telas menores:

- controles utilizam somente ícones;
- painéis reduzem largura e densidade;
- mapa utiliza uma coluna;
- descrição contextual é condensada;
- o Hall preserva zoom e pinça;
- o passeio guiado reduz a necessidade de movimentos complexos;
- o modo Econômico reduz partículas e detalhes.

## 11. Acessibilidade

- controles com rótulos acessíveis;
- navegação por teclado nos painéis DOM;
- mapa textual;
- descrição de todos os setores;
- alto contraste;
- redução de movimento;
- redução de transparências;
- fallback 2D;
- sons opcionais;
- nenhuma informação depende somente de cor.

## 12. Limitações honestas

- a arquitetura é procedural e ainda não utiliza um cenário completo criado manualmente no Blender;
- apenas o setor elétrico utiliza assets GLB do pacote atual;
- as demais prévias são representações procedurais;
- não há colisão física ou caminhada livre em primeira pessoa;
- o passeio guiado utiliza transições de câmera, não um avatar;
- o áudio é sintético e discreto;
- a validação visual final em aparelhos reais continua necessária;
- Three.js ainda pode usar a CDN fixa quando o vendor local não estiver disponível.

## 13. Critérios atendidos

- arquitetura fechada;
- setores identificáveis;
- corredores e passarela;
- elevador central;
- iluminação setorial;
- portais integrados;
- prévias físicas;
- câmera 360°;
- zoom;
- passeio guiado;
- teletransporte;
- mapa 3D;
- alternativa 2D;
- áudio espacial opcional;
- adaptação mobile;
- testes estruturais.

## 14. Próxima evolução

A Fase Visual 5 deverá implementar o Sistema Universal de Interação:

- raycasting compartilhado;
- seleção e contorno;
- gizmos;
- manipulação por eixos;
- pegar, soltar e girar;
- encaixe assistido;
- conectores;
- histórico e undo/redo;
- controles consistentes em todos os laboratórios.


## Atualização v0.3.3

O setor Ondas e Óptica foi ativado e passa a abrir diretamente o laboratório premium pela rota `#waves`. O Hall mantém sete setores físicos e agora possui sete acessos ativos.

## Atualização v0.3.4

O Hall passou a possuir oito setores físicos e oito acessos ativos. Foi incluída a sala **Termologia e Fluidos**, com prévia animada de recipiente térmico, termômetro, partículas moleculares e pistão gasoso.
