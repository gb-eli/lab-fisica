# DESIGN SYSTEM CIENTÍFICO — FÍSICA IMERSIVA 360

## Versão

- Projeto: Física Imersiva 360
- Design system: 1.0
- Plataforma: v0.2.3
- Fase: Visual 1
- Estado: implementado na interface compartilhada

## 1. Objetivo

Criar uma linguagem visual única para Hall, laboratórios, instrumentos, painéis, avisos e módulos avançados. O design não deve parecer um painel administrativo genérico nem um jogo infantil. A referência é um centro contemporâneo de pesquisa e instrumentação.

## 2. Princípios

1. A cena científica permanece como elemento principal.
2. A interface aparece por contexto e pode ser recolhida.
3. Cores representam função e estado, não decoração aleatória.
4. Dados, unidades e instrumentos usam linguagem técnica consistente.
5. Efeitos luminosos destacam operação, medição ou risco.
6. Todos os estados possuem texto ou símbolo além da cor.
7. O mesmo contrato visual deve funcionar em desktop e mobile.

## 3. Linguagem de materiais

### Metal técnico

Usado em:

- estruturas;
- instrumentos;
- bancadas;
- suportes;
- molduras;
- painéis de máquina.

Características:

- tons grafite e aço;
- brilho controlado;
- bordas com contraste discreto;
- sem cromado excessivo.

### Vidro funcional

Usado em:

- proteções;
- painéis de observação;
- HUDs;
- divisórias;
- superfícies holográficas.

O vidro precisa ter função e não deve reduzir a leitura.

### Cerâmica e isolantes

Usados em:

- resistores;
- isoladores;
- suportes térmicos;
- partes de laboratório elétrico.

### Borracha e polímeros

Usados em:

- cabos;
- manoplas;
- proteções;
- pés de equipamentos;
- controles.

## 4. Paleta funcional

- `ready`: sistema disponível ou funcionamento normal;
- `measure`: instrumento ou leitura ativa;
- `attention`: aproximação, limite didático ou condição que exige observação;
- `risk`: condição de risco simulado;
- `failure`: falha, interrupção ou componente danificado;
- `disabled`: recurso indisponível ou desligado.

Cada módulo possui uma cor de identificação:

- Hall: ciano e azul;
- Eletrostática: ciano elétrico;
- Eletrodinâmica: âmbar e laranja;
- Física Avançada: magenta e violeta;
- Roadmap: azul e verde.

A cor do módulo não substitui as cores de segurança.

## 5. Tipografia

### Interface

Família de sistema com boa legibilidade em Android, iOS, ChromeOS e Windows.

### Técnica

Fonte monoespaçada de sistema para:

- unidades;
- fórmulas;
- leituras;
- estados;
- códigos de instrumentos;
- indicadores de versão.

## 6. Componentes compartilhados

### Topbar

- marca;
- identificação do setor;
- nome do módulo;
- qualidade;
- ajuda;
- configurações.

### Dock

- ícone vetorial;
- rótulo curto;
- indicador luminoso do módulo ativo;
- área de toque mínima adequada.

### Cabeçalho do laboratório

- classificação do módulo;
- nome da experiência;
- explicação curta;
- linha de identificação visual.

### Toolbar científica

- botões com ícone e texto;
- estado ativo;
- operação clara;
- sem símbolos ambíguos isolados.

### Status rail

Indica condições como:

- modelo ideal;
- sonda ativa;
- instrumento calibrado;
- escala ampliada;
- aproximação térmica;
- condição de atenção.

### Painel de instrumento

Deve apresentar:

- ícone ou miniatura;
- classe do instrumento;
- estado;
- função atual;
- leitura quando aplicável.

### Readout

- rótulo em caixa alta técnica;
- valor monoespaçado;
- unidade obrigatória;
- separadores discretos.

## 7. Ícones

A biblioteca `js/ui/icons.js` fornece SVGs vetoriais leves e independentes de fontes de ícones externas.

Categorias iniciais:

- navegação;
- eletrostática;
- circuitos;
- campo;
- potencial;
- câmera;
- qualidade;
- instrumentos;
- salvar e exportar;
- alertas e segurança.

Novos ícones devem manter:

- `viewBox 0 0 24 24`;
- traço arredondado;
- espessura consistente;
- ausência de detalhes ilegíveis em 16–20 px;
- significado científico ou operacional claro.

## 8. Densidade e escala

Opções implementadas:

- densidade confortável;
- densidade compacta;
- escala 90%;
- escala 100%;
- escala 110%;
- escala 120%;
- redução de transparências.

Essas opções são armazenadas localmente e não exigem cadastro.

## 9. Estados de interação

Todo elemento interativo deverá avaliar:

- padrão;
- hover;
- foco por teclado;
- pressionado;
- ativo;
- selecionado;
- bloqueado;
- desativado;
- carregando;
- falha.

Objetos 3D ainda precisarão receber, na Fase Visual 5:

- contorno de seleção;
- encaixe compatível;
- conexão;
- energização;
- medição;
- risco;
- superaquecimento.

## 10. Responsividade

### Desktop

- dock com ícone e texto lado a lado;
- painéis laterais;
- cabeçalho contextual completo.

### Tablet

- dock reduzido;
- painéis alternáveis;
- câmera orbital ou bancada.

### Celular

- dock verticalmente compacto;
- ícone acima do texto;
- cabeçalho contextual oculto quando necessário;
- painéis inferiores;
- status científicos em chips curtos;
- respeito às áreas seguras.

## 11. Acessibilidade

- foco visível;
- alto contraste;
- redução de movimento;
- redução de transparência;
- escala de interface;
- ícone acompanhado de texto;
- estados não dependentes somente da cor;
- controles com rótulos acessíveis.

## 12. Arquivos

- `css/design-system.css`: tokens e componentes visuais;
- `js/design-system.js`: temas dos módulos e configurações de interface;
- `js/ui/icons.js`: biblioteca de ícones SVG;
- `assets/graphics-standard.json`: contrato legível por máquina;
- `docs/PADRAO_GRAFICO_OBRIGATORIO.md`: requisitos globais.

## 13. Limites desta fase

A Fase Visual 1 melhora a linguagem e consistência da plataforma, mas não resolve ainda:

- modelos GLB de alta fidelidade;
- texturas PBR definitivas;
- environment maps;
- pós-processamento compartilhado;
- cabos físicos;
- instrumentos elétricos completos;
- iluminação premium do Hall;
- ray tracing relativístico;
- ambientes finais dos laboratórios.

Esses itens pertencem às fases visuais seguintes.

## 14. Próxima fase

### Fase Visual 2 — Núcleo de renderização premium

Entregas planejadas:

- Three.js local ou empacotado;
- classe compartilhada de renderer;
- câmeras padronizadas;
- resize e resolução dinâmica;
- iluminação física híbrida;
- environment maps;
- tone mapping único;
- sombras adaptativas;
- pós-processamento opcional;
- monitor de FPS, draw calls, triângulos e memória;
- recuperação de contexto WebGL;
- descarte correto de recursos.
