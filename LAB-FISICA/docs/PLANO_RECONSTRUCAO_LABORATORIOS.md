# Plano de Reconstrução dos Laboratórios

## Princípio

Nenhum novo conteúdo deve ser adicionado enquanto os laboratórios existentes não tiverem objetivo claro, cena legível, controles previsíveis, resultados compreensíveis e recuperação segura.

## R1 — Estrutura comum e navegação — concluída em v0.4.0

- catálogo único;
- perguntas e objetivos consistentes;
- modos Guiado, Explorar e Apresentação;
- Laboratório, Cena, Controles, Resultados e Apoio;
- seletor de cenário;
- mobile cena-primeiro;
- hub por trilha;
- resultados organizados.

## R2 — Hall, Eletrostática e Eletricidade — concluída em v0.4.1

- Hall orientado por trilha;
- Eletrostática 3D manipulável e fallback 2D;
- presets de atração, repulsão e assimetria;
- bancada elétrica com montagem segura;
- recursos avançados preservados em Apoio;
- revisão mobile inicial.

## R3 — Eletromagnetismo, Energia e Mecânica — concluída em v0.4.2

- 28 cenários guiados;
- leituras contextuais;
- pausa e reinício;
- correção das leituras de rede;
- parâmetros essenciais antes dos avançados;
- motores científicos preservados.

## R4 — Ondas, Termofluidos e Física Avançada — concluída em v0.4.3

- 35 cenários comparáveis;
- validade dos modelos declarada;
- resultados contextuais;
- pausa e reinício;
- gráficos reorganizados;
- mobile com cena prioritária.

## R5 — Playtest e fechamento estrutural — concluída em v0.4.4

- Chromium desktop 1365×768;
- Chromium mobile 390×844;
- dez rotas exercitadas;
- cinco visualizações por laboratório;
- troca de cenários e reinícios visíveis;
- navegação rápida e cleanup;
- correção de erros de execução;
- correção de sobreposição e áreas de clique;
- screenshots e relatório JSON reproduzível;
- fallback 2D aprovado.

## Próxima etapa: piloto WebGL por evidência

A reconstrução estrutural foi encerrada. A expansão continua suspensa até que a plataforma seja testada em:

- celulares Android de 320, 360, 390 e 412 px;
- tablet em retrato e paisagem;
- Chromebook;
- notebook escolar;
- computador de laboratório;
- perfis Econômico, Médio, Alto e Ultra;
- sessões mínimas de 30 minutos.

Cada problema deverá registrar rota, aparelho, navegador, perfil, passos de reprodução, captura e diagnóstico exportado.

## Critério para considerar um laboratório funcional

1. Abre sem erro fatal de console.
2. Objetivo é compreendido antes da manipulação.
3. Cenário inicial é legível em até cinco segundos.
4. Um parâmetro alterado produz resposta visível e numérica.
5. Reiniciar devolve estado confiável.
6. Trocar de rota desmonta a cena anterior.
7. Modo 2D mantém o conteúdo utilizável.
8. Mobile não encobre a cena com painéis.
9. Resultados usam unidades e nomes consistentes.
10. Evidência registra o que realmente foi realizado.
11. WebGL permanece estável durante o período de teste definido.


## R6 — Piloto WebGL — concluída em v0.4.5

- pré-teste bruto antes do Three.js;
- compilação e desenho verificados por pixel;
- classificação automática de capacidade;
- watchdog do primeiro quadro;
- fallback 2D automático;
- perda/restauração testadas;
- desktop e mobile virtuais aprovados com SwiftShader;
- GPU física e pacote Three.js local continuam pendentes.

## Próxima etapa

Piloto em celulares, Chromebook e computadores reais, começando por Hall, Eletrostática e Eletricidade. Cada falha deve ser acompanhada pelo JSON do pré-teste e pela captura da rota.
