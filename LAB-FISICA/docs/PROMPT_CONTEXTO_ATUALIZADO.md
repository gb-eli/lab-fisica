# Contexto atual — v0.4.5

A versão atual é 0.4.5. A reconstrução R1–R5 foi preservada e a R6 adicionou pré-teste WebGL, classificação de capacidade, teste de shaders/desenho, perda/restauração, watchdog do primeiro quadro, fallback 2D e piloto por software. Não declarar GPU física ou 3D totalmente offline como validados. O pacote local completo do Three.js permanece pendente.

# Prompt de Continuidade — Física Imersiva 360 v0.4.4

## Implementado em v0.4.4

A Fase R5 encerrou a reconstrução estrutural com playtest real de navegador no modo seguro 2D. Foram corrigidos cleanup de Mecânica/Ondas/Termofluidos, sobreposição dos botões de visualização, HUD duplicado, densidade do catálogo e isolamento de falhas após navegação. O smoke test aprovou 10 rotas em desktop e mobile sem erros de console ou rota.

## Próxima prioridade

Não expandir conteúdos. Executar validação WebGL em aparelhos reais, preencher a matriz de GPU/toque e corrigir apenas defeitos reproduzidos. Depois disso, decidir se a plataforma entra em piloto escolar.

# Prompt de Continuidade — Física Imersiva 360 v0.4.3

## Implementado em v0.4.3

Fase R4 de reconstrução de Ondas, Termofluidos e Física Avançada:
- 35 cenários guiados;
- validade do modelo explícita;
- resultados contextuais em Termofluidos;
- pausa e reinício em Física Avançada;
- reinício em Ondas;
- interface mobile compacta;
- motores científicos preservados.

## Próxima prioridade

Fase R5: playtest por rota e por dispositivo, correções visuais reais, fechamento da reconstrução e incorporação local do Three.js quando possível.

# Prompt de Continuidade — Física Imersiva 360 v0.4.2

## Implementado em v0.4.2

Fase R3 concluída: Eletromagnetismo, Energia e Mecânica receberam cenários guiados, leituras contextuais, pausa/reinício e correções de lógica. A próxima fase planejada é R4: Ondas, Termofluidos e Física Avançada. Não criar novos laboratórios antes do playtest transversal.


O projeto está em reconstrução de UX/UI, gráficos e lógica. O usuário informou que a plataforma estava bugada, confusa e com muitas funções sem resposta clara. Não retomar expansão até concluir a revisão prática dos laboratórios existentes.


### Contratos da R3

- não adicionar novos laboratórios;
- usar cenários de referência antes da exploração livre;
- manter uma pergunta central e três etapas;
- alterar uma variável por vez;
- reunir resultados prioritários;
- manter ferramentas avançadas, mas fora do primeiro contato;
- próxima fase: R4, reconstrução de Ondas, Termofluidos e Física Avançada.

## Implementado em v0.4.1

- catálogo único de oito laboratórios;
- workspace comum com Laboratório, Cena, Controles, Resultados e Apoio;
- modos Guiado, Explorar e Apresentação;
- cenário principal consistente;
- pergunta central, objetivo e três etapas;
- resultados organizados;
- painéis avançados recolhidos;
- mobile cena-primeiro;
- hub por trilha e conteúdo;
- auditoria estrutural de UX.


- Hall reorganizado por trilha recomendada e ação principal;
- Eletrostática reconstruída em Three.js com arraste 3D e fallback 2D;
- presets Atração, Repulsão e Assimétrico;
- campo, força e potencial sincronizados com a cena;
- bancada elétrica com montagem guiada e início seguro;
- ferramentas avançadas preservadas em Apoio/Explorar;
- mobile com cena primeiro e controles essenciais.

## Regras obrigatórias

1. Uma ação principal por estado da experiência.
2. Cena 3D deve permanecer visualmente livre.
3. Controles essenciais vêm antes de ferramentas avançadas.
4. Cada cenário deve responder visivelmente e numericamente a parâmetros.
5. Não afirmar validação visual sem captura ou teste real.
6. Manter motor científico separado da renderização.
7. Toda falha 3D precisa preservar o modo 2D.
8. Reinício, pausa, troca de cenário e saída devem ser testados.
9. Não criar novo conteúdo antes de Hall, Eletrostática e Eletricidade passarem por playtest.
10. Registrar bugs por rota, aparelho, perfil gráfico e passos de reprodução.

## Próxima prioridade

Executar a Fase R3: Eletromagnetismo, Energia e Mecânica, sem perder o padrão de clareza consolidado em R2. Revisar composição, escala, objetos, controles, cabos, instrumentos, reinício, mobile e clareza do objetivo. Depois seguir para os demais grupos descritos em `PLANO_RECONSTRUCAO_LABORATORIOS.md`.