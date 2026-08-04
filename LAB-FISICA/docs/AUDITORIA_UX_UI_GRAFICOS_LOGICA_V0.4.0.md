# Auditoria de UX/UI, Gráficos e Lógica — v0.4.0

## Motivo

O usuário relatou que a plataforma estava bugada, confusa e com funções que não respondiam de forma previsível. A auditoria confirmou que os testes científicos eram fortes, mas a estrutura de interface havia crescido sem um contrato único de uso.

## Evidência estrutural

A contagem estática dos templates encontrou:

- 94 botões;
- 154 entradas;
- 20 seletores;
- 45 cartões ou painéis;
- aproximadamente 229 KiB somente nos módulos de interface dos laboratórios.

Esses números não significam que tudo aparece simultaneamente, mas mostram por que a plataforma precisava de divulgação progressiva e de uma hierarquia comum.

## Problemas mapeados

### P0 — funcionamento e recuperação

1. O pacote local completo do Three.js não está presente.
2. O primeiro carregamento 3D pode depender da rede.
3. O navegador automatizado do ambiente bloqueia páginas locais, impedindo capturas confiáveis.
4. Validação de toque, sombras, escala e sobreposição depende de hardware real.

### P1 — organização e carga cognitiva

1. Hall, hub, roteiros e módulos repetiam metadados.
2. Cada laboratório usava nomes e posições diferentes para cenário, controles e resultados.
3. Painéis avançados apareciam junto com as ações essenciais.
4. No celular, cena e controles disputavam a mesma área.
5. A bancada elétrica apresentava montagem, instrumentos, falhas, histórico e evidências com peso semelhante.

### P2 — qualidade gráfica e cenários

1. A linguagem visual procedural varia entre laboratórios.
2. Escalas e proporções ainda precisam de revisão por cena.
3. Alguns objetos são didáticos, mas parecem decorativos por falta de feedback contextual.
4. Luzes e partículas precisam ser calibradas por objetivo, não apenas por impacto visual.
5. Cenários precisam mostrar claramente onde olhar e o que manipular.

### P2 — arquitetura lógica

1. Alguns módulos concentram estado, interface, solver e renderização.
2. A bancada elétrica é o módulo mais complexo e deve ser dividida em controladores menores.
3. Resultados científicos ainda possuem formatos visuais diferentes.
4. Eventos e controles precisam de testes de inicialização e desmontagem por rota.

## Correções implementadas

- catálogo central `js/labs/lab-catalog.js`;
- workspace comum `js/ui/experience-workspace.js`;
- estilo comum `css/experience-workspace.css`;
- cinco visualizações: Laboratório, Cena, Controles, Resultados e Apoio;
- três modos de experiência;
- seletor principal de cenário;
- pergunta central, objetivo, etapas e controles consistentes;
- resumo vivo de resultados;
- recolhimento de painéis secundários;
- cena como primeira tela no celular;
- hub organizado por trilha e área;
- auditoria reproduzível em `tools/audit_ux_structure.mjs`;
- relatório em `assets/ux-audit.json`.

## Limites desta versão

Não foram declarados como resolvidos sem playtest:

- profundidade e composição visual de todos os cenários;
- legibilidade de instrumentos em aparelhos reais;
- conforto dos gestos;
- colisões e sobreposição física;
- consumo de memória prolongado;
- qualidade percebida dos modelos e materiais;
- funcionamento offline do 3D no primeiro acesso.
