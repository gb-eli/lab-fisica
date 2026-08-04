# PADRÃO GRÁFICO OBRIGATÓRIO DOS LABORATÓRIOS

## 1. Aplicação

Este padrão é obrigatório para Hall, laboratórios, instrumentos, experiências avançadas e futuras expansões da Física Imersiva 360.

## 2. Cinco dimensões de realismo

### Realismo visual

- materiais PBR coerentes;
- escala e proporções consistentes;
- iluminação funcional;
- desgaste discreto e controlado;
- etiquetas, parafusos, terminais e peças relevantes;
- sombras e reflexos adequados ao perfil.

### Realismo físico

- movimento alimentado pelo estado científico;
- aceleração, rotação, força e temperatura coerentes;
- limites e aproximações documentados;
- nenhuma animação falsa usada como resultado.

### Realismo instrumental

- instrumentos possuem escala, resolução, faixa e terminais;
- leituras respondem ao circuito ou fenômeno;
- erros de ligação e sobrecarga são simulados;
- controles visuais correspondem a controles funcionais.

### Realismo interativo

- objetos podem ser inspecionados;
- zoom e rotação funcionam;
- peças podem ser encaixadas quando o experimento exigir;
- controles funcionam por mouse e toque;
- ações possuem feedback visual, sonoro e textual.

### Realismo ambiental

- cenário possui finalidade científica;
- bancadas, iluminação, sinalização e segurança são coerentes;
- nenhum efeito deve competir com a leitura do experimento;
- partículas precisam representar dados, fluxo ou ambiente justificado.

## 3. Câmeras obrigatórias

Cada laboratório deverá avaliar a necessidade de:

- câmera livre;
- câmera orbital;
- câmera de bancada;
- câmera do instrumento;
- câmera microscópica;
- câmera térmica;
- câmera de corte;
- câmera de comparação;
- modo apresentação;
- modo fotografia.

## 4. Estados visuais obrigatórios

- padrão;
- selecionado;
- foco;
- encaixe disponível;
- conectado;
- energizado;
- em movimento;
- medição ativa;
- atenção;
- risco;
- falha;
- desativado;
- indisponível;
- superaquecido.

## 5. Perfis de qualidade

### Econômico

- meta de estabilidade acima de efeitos;
- pixel ratio limitado;
- sombras essenciais ou desativadas;
- texturas reduzidas;
- partículas mínimas;
- LOD agressivo;
- sem pós-processamento pesado.

### Médio

- materiais completos;
- sombras principais;
- partículas moderadas;
- ambiente detalhado;
- reflexos simplificados.

### Alto

- sombras detalhadas;
- maior densidade de partículas;
- materiais e texturas de maior resolução;
- pós-processamento moderado;
- reflexos selecionados.

### Ultra

- maior resolução permitida pelo dispositivo;
- LOD detalhado;
- sombras e environment map de alta qualidade;
- pós-processamento completo, porém controlável;
- partículas e efeitos volumétricos pontuais.

### Científico

- prioriza vetores, escalas, gráficos e instrumentos;
- reduz efeitos decorativos;
- aumenta legibilidade e precisão visual;
- preserva o mesmo cálculo científico dos outros perfis.

## 6. Limites de interface

- centro e área de manipulação permanecem livres;
- HUD persistente deve ocupar pouco espaço;
- textos longos ficam em painéis recolhíveis;
- apenas uma superfície principal de análise deve abrir por vez no celular;
- menus suspendem o controle da câmera;
- botões móveis respeitam áreas seguras e orientação.

## 7. Assets

Todo asset definitivo deve possuir:

- nome estável;
- escala em metros;
- origem e pivô corretos;
- materiais reaproveitáveis;
- versão GLB/glTF;
- LOD quando necessário;
- colisores separados;
- tamanho documentado;
- licença documentada;
- versão Econômica quando o objeto for pesado.

## 8. Partículas

Partículas podem representar:

- fluxo;
- campo;
- calor;
- emissão;
- trajetória;
- densidade;
- poeira ambiental discreta;
- sonificação visual.

Partículas não podem:

- esconder instrumentos;
- sugerir que linhas de campo são matéria;
- alterar o resultado científico;
- permanecer em quantidade máxima em aparelhos fracos;
- ser usadas apenas para preencher uma cena vazia.

## 9. Critério mínimo para chamar de laboratório completo

- ambiente tridimensional coerente;
- ao menos uma montagem manipulável;
- variáveis funcionais;
- cálculo científico testado;
- instrumento funcional;
- gráfico ou tabela vinculado aos dados;
- câmera de análise;
- tutorial contextual;
- acessibilidade básica;
- perfil Econômico utilizável;
- captura visual validada;
- estados de erro e reinício.
